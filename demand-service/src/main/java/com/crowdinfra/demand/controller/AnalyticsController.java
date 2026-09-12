package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.service.GeminiService;
import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.repository.DemandRepository;
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
    private final DemandRepository demandRepository;

    @GetMapping("/{id}")
    public ResponseEntity<String> getAnalysis(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        if (!"BUSINESS".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only BUSINESS or ADMIN users can access AI analytics");
        }

        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        String analysis = geminiService.analyze(demand);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/{id}/refresh")
    public ResponseEntity<String> refreshAnalysis(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        if (!"BUSINESS".equals(userRole) && !"ADMIN".equals(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only BUSINESS or ADMIN users can access AI analytics");
        }

        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demand not found"));

        String analysis = geminiService.refreshAnalysis(demand);
        return ResponseEntity.ok(analysis);
    }
}
