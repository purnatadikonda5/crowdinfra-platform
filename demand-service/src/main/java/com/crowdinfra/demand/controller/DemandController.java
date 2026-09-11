package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/demand")
@RequiredArgsConstructor
public class DemandController {

    private final DemandService demandService;

    @PostMapping
    public ResponseEntity<Demand> createDemand(
            @RequestPart("demand") Demand demand,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("X-User-Id") String userId) {
        
        Demand created = demandService.createDemand(demand, images, userId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Demand> updateDemand(
            @PathVariable String id,
            @RequestBody Demand demand,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        Demand updated = demandService.updateDemand(id, demand, userId, userRole);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemand(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        
        demandService.deleteDemand(id, userId, userRole);
        return ResponseEntity.noContent().build();
    }
}
