package com.crowdinfra.property.repository;

import com.crowdinfra.property.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PropertyRepositoryCustom {
    Page<Property> searchProperties(String category, String listingType, Double minPrice, Double maxPrice, Pageable pageable);
    
    List<Property> findPropertiesNear(Double lat, Double lng, Double radiusInMeters);
}
