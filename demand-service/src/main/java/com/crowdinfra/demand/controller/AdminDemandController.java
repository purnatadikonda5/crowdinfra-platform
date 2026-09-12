package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.service.DemandService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/demands")
@Tag(name = "Admin Demand Operations", description = "Admin endpoints for demands")
public class AdminDemandController {

    private final DemandService demandService;

    public AdminDemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Demand> updateStatus(@PathVariable String id, @RequestHeader("X-User-Role") String userRole, @RequestBody Map<String, String> body) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(403).build();
        }
        
        String status = body.get("status");
        log.info("Admin setting status of demand {} to {}", id, status);
        return ResponseEntity.ok(demandService.updateStatus(id, status));
    }
}
