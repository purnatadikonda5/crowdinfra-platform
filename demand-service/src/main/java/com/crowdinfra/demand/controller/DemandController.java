package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.client.UserServiceClient;
import com.crowdinfra.demand.dto.CreateDemandRequest;
import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.service.DemandService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/demands")
@Tag(name = "Demand Operations", description = "Endpoints for demands and AI analysis")
public class DemandController {

    private final DemandService demandService;
    private final UserServiceClient userServiceClient;

    public DemandController(DemandService demandService, UserServiceClient userServiceClient) {
        this.demandService = demandService;
        this.userServiceClient = userServiceClient;
    }

    @GetMapping
    public ResponseEntity<List<Demand>> getDemands() {
        return ResponseEntity.ok(demandService.getAllDemands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Demand> getDemand(@PathVariable String id) {
        return demandService.getDemandById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<Demand>> getMyDemands(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(demandService.getDemandsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Demand> createDemand(@RequestHeader("X-User-Id") String userId, @RequestBody CreateDemandRequest request) {
        log.info("User {} is creating a demand", userId);
        
        // Advanced Distributed Systems: Call User Service to get actual user profile details
        String actualUserName = request.getUserName();
        try {
            UserServiceClient.UserDto userDto = userServiceClient.getUserById(userId);
            if (userDto != null && userDto.username() != null) {
                actualUserName = userDto.username();
                log.info("Successfully fetched user profile from user-service for user: {}", actualUserName);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user profile from user-service for userId {}: {}", userId, e.getMessage());
        }

        Demand demand = Demand.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .userName(actualUserName)
                .build();
        return ResponseEntity.ok(demandService.createDemand(demand, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Demand> updateDemand(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestBody Demand updatedDemand) {
        log.info("User {} is updating demand {}", userId, id);
        return ResponseEntity.ok(demandService.updateDemand(id, updatedDemand, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemand(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-User-Role") String userRole) {
        log.info("User {} is deleting demand {}", userId, id);
        demandService.deleteDemand(id, userId, userRole);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<Demand> toggleVote(@PathVariable String id, @RequestHeader("X-User-Id") String userId) {
        log.info("User {} is voting on demand {}", userId, id);
        return ResponseEntity.ok(demandService.toggleVote(id, userId));
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<String> getAnalysis(@PathVariable String id, @RequestHeader("X-User-Role") String userRole) {
        if (!"BUSINESS".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(403).body("{\"error\": \"Unauthorized role\"}");
        }
        return ResponseEntity.ok(demandService.getAnalysis(id));
    }

    @PostMapping("/{id}/analysis/refresh")
    public ResponseEntity<String> refreshAnalysis(@PathVariable String id, @RequestHeader("X-User-Role") String userRole) {
        if (!"BUSINESS".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(403).body("{\"error\": \"Unauthorized role\"}");
        }
        return ResponseEntity.ok(demandService.refreshAnalysis(id));
    }
}
