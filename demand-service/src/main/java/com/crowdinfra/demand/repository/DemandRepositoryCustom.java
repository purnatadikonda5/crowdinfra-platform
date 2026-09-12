package com.crowdinfra.demand.repository;

import com.crowdinfra.demand.model.Demand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DemandRepositoryCustom {
    Page<Demand> findDemandsWithFilters(String category, String status, Double lat, Double lng, Double radiusInMeters, Pageable pageable);
    
    List<Demand> findWithinBoundingBox(double minLat, double maxLat, double minLng, double maxLng);
}
