package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/demands")
@RequiredArgsConstructor
public class AdminDemandController {

    private final DemandService demandService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<Demand> updateStatus(
            @PathVariable String id,
            @RequestParam Demand.Status status,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        Demand updated = demandService.updateStatus(id, status, userRole);
        return ResponseEntity.ok(updated);
    }
}
