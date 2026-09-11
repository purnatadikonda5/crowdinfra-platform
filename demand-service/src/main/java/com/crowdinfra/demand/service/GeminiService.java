package com.crowdinfra.demand.service;

import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.repository.DemandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestTemplate restTemplate;
    private final StringRedisTemplate redisTemplate;
    private final DemandRepository demandRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public String analyzeDemand(String demandId, boolean forceRefresh) {
        String cacheKey = "gemini:demand:" + demandId;

        // 1. Check Redis Cache
        if (!forceRefresh) {
            String cachedResponse = redisTemplate.opsForValue().get(cacheKey);
            if (cachedResponse != null) {
                return cachedResponse;
            }
        }

        // 2. Fetch Demand
        Demand demand = demandRepository.findById(demandId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        // 3. Construct Prompt
        String prompt = String.format("Provide an executive summary and market potential analysis for the following community demand. " +
                "Title: %s. Description: %s. Category: %s. " +
                "Return the response in a structured JSON format with 'executiveSummary' and 'marketPotential' keys.",
                demand.getTitle(), demand.getDescription(), demand.getCategory());

        // 4. Call Gemini API
        String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt.replace("\"", "\\\"").replace("\n", " ") + "\"}]}]}";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(GEMINI_API_URL + apiKey, entity, String.class);
            
            // 5. Cache in Redis with 24-hour TTL
            redisTemplate.opsForValue().set(cacheKey, response, Duration.ofHours(24));
            
            // 6. Update Demand model
            demand.setAiAnalysis(response);
            demand.setAiAnalyzedAt(LocalDateTime.now());
            demandRepository.save(demand);
            
            return response;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to analyze demand with AI", e);
        }
    }
}
