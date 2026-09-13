package com.crowdinfra.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/signup",
            "/api/auth/send-otp",
            "/api/auth/verify-otp",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/user/ratings",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-resources"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow CORS preflight requests through without authentication
        if (request.getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        // Allow public paths and GET requests for browsing demands/properties/comments
        // BUT protect user-specific endpoints that need X-User-Id injection
        boolean isUserSpecific = path.contains("/user/me") || (path.contains("/user/") && path.contains("/vote")) || path.contains("/analysis");
        boolean isPublicPath = !isUserSpecific && (
               PUBLIC_PATHS.stream().anyMatch(path::startsWith) ||
               (request.getMethod().name().equals("GET") && (path.startsWith("/api/demands") || path.startsWith("/api/properties") || path.startsWith("/api/comments"))));
        if (isPublicPath) {
            return chain.filter(exchange);
        }

        // Extract JWT token from cookie or Authorization header
        String token = null;
        if (request.getCookies().containsKey("token")) {
            token = request.getCookies().getFirst("token").getValue();
        } else if (request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            javax.crypto.SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.getSubject();
            String userRole = claims.get("role", String.class);

            // Inject user identity headers for downstream microservices
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Role", userRole)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());

        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
