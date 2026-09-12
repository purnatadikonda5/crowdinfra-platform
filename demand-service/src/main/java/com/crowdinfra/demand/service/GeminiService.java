package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.Demand;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final StringRedisTemplate redisTemplate;
    private final RestClient restClient;

    private static final Duration CACHE_TTL = Duration.ofHours(24);
    // Use the latest gemini model requested by user
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

    public GeminiService(StringRedisTemplate redisTemplate, RestClient.Builder restClientBuilder) {
        this.redisTemplate = redisTemplate;
        // Use modern Spring Boot 3 RestClient instead of RestTemplate
        this.restClient = restClientBuilder.build();
    }

    public String analyze(Demand demand) {
        String cacheKey = "gemini:demand:" + demand.getId();
        String cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            log.info("Returning cached Gemini analysis for demand {}", demand.getId());
            return cached;
        }

        log.info("Calling Gemini API for demand {}", demand.getId());
        String prompt = buildPrompt(demand);
        String result = callGeminiApi(prompt);

        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);
        return result;
    }

    public String refreshAnalysis(Demand demand) {
        String cacheKey = "gemini:demand:" + demand.getId();
        log.info("Force refreshing Gemini API for demand {}", demand.getId());
        String prompt = buildPrompt(demand);
        String result = callGeminiApi(prompt);
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);
        return result;
    }

    private String callGeminiApi(String prompt) {
        try {
            // Build the JSON request body
            String requestJson = String.format("{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}", prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            // Fluent and clean API call with X-goog-api-key header
            String response = restClient.post()
                    .uri(GEMINI_API_URL)
                    .header("X-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            return response != null ? response : "{}";
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return "{\"error\": \"Failed to analyze demand\"}";
        }
    }

    private String buildPrompt(Demand d) {
        String address = (d.getLocation() != null && d.getLocation().getAddress() != null) ? d.getLocation().getAddress() : "Unknown";
        return String.format(
            "Analyze this infrastructure demand as a business consultant. " +
            "Title: %s | Category: %s | Location: %s | Votes: %d " +
            "Description: %s " +
            "Return JSON with: executiveSummary, marketPotential (score 0-100, description), " +
            "competitiveAnalysis, resourceRequirements, successFactors.",
            d.getTitle(), d.getCategory(), address, d.getUpvoteCount(), d.getDescription()
        );
    }
}
