package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/analytics/demand")
@RequiredArgsConstructor
public class AnalyticsController {

    private final GeminiService geminiService;

    @GetMapping("/{id}")
    public ResponseEntity<String> getAnalysis(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        if (!"BUSINESS".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only BUSINESS or ADMIN users can access AI analytics");
        }

        String analysis = geminiService.analyzeDemand(id, false);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/{id}/refresh")
    public ResponseEntity<String> refreshAnalysis(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        if (!"BUSINESS".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only BUSINESS or ADMIN users can access AI analytics");
        }

        String analysis = geminiService.analyzeDemand(id, true);
        return ResponseEntity.ok(analysis);
    }
}
