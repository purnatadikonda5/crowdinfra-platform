package com.crowdinfra.demand.controller;

import com.crowdinfra.demand.model.ClusterDto;
import com.crowdinfra.demand.model.Demand;
import com.crowdinfra.demand.service.DemandService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @GetMapping
    public ResponseEntity<Page<Demand>> getDemands(
            @RequestParam(required = false) Demand.Category category,
            @RequestParam(required = false) Demand.Status status,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false, defaultValue = "5000") Double radius,
            Pageable pageable) {
        
        Page<Demand> demands = demandService.getDemands(category, status, lat, lng, radius, pageable);
        return ResponseEntity.ok(demands);
    }

    @GetMapping("/clusters")
    public ResponseEntity<List<ClusterDto>> getClusters(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        
        List<ClusterDto> clusters = demandService.getHeatmapClusters(minLat, maxLat, minLng, maxLng);
        return ResponseEntity.ok(clusters);
    }

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

    @PostMapping("/{id}/vote")
    public ResponseEntity<Demand> toggleUpvote(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        
        Demand updated = demandService.toggleUpvote(id, userId);
        return ResponseEntity.ok(updated);
    }
}
