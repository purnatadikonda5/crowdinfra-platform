package com.crowdinfra.property.controller;

import com.crowdinfra.property.dto.CreatePropertyRequest;
import com.crowdinfra.property.model.Property;
import com.crowdinfra.property.service.PropertyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/properties")
@Tag(name = "Property Operations", description = "Endpoints for properties and real estate")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<List<Property>> getProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Property>> searchProperties(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            Pageable pageable) {
        return ResponseEntity.ok(propertyService.searchProperties(category, listingType, minPrice, maxPrice, pageable));
    }
    
    @GetMapping("/near-demand")
    public ResponseEntity<List<Property>> getPropertiesNearDemand(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5000") Double radius) {
        return ResponseEntity.ok(propertyService.getPropertiesNearDemand(lat, lng, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getProperty(@PathVariable String id) {
        return propertyService.getPropertyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<Property>> getMyProperties(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(propertyService.getPropertiesByOwnerId(userId));
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestHeader("X-User-Id") String userId, @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole, @RequestBody CreatePropertyRequest request) {
        
        GeoJsonPoint location = null;
        if (request.getLat() != null && request.getLng() != null) {
            location = new GeoJsonPoint(request.getLng(), request.getLat());
        }

        log.info("Landlord {} is creating a property", userId);
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .listingType(request.getListingType())
                .ownerName(request.getOwnerName())
                .contactNumber(request.getContactNumber())
                .location(location)
                .address(request.getAddress())
                .images(request.getImages())
                .price(request.getPrice())
                .areaSqft(request.getAreaSqft())
                .build();
                
        return ResponseEntity.ok(propertyService.createProperty(property, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestBody Property updatedProperty) {
        log.info("User {} is updating property {}", userId, id);
        return ResponseEntity.ok(propertyService.updateProperty(id, updatedProperty, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestHeader(value = "X-User-Role", defaultValue = "CITIZEN") String userRole) {
        log.info("User {} is deleting property {}", userId, id);
        propertyService.deleteProperty(id, userId, userRole);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Property> updateStatus(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        log.info("User {} setting status of property {} to {}", userId, id, status);
        return ResponseEntity.ok(propertyService.updateStatus(id, status, userId));
    }

    @PostMapping("/{id}/inquiry")
    public ResponseEntity<Void> submitInquiry(@PathVariable String id, @RequestHeader("X-User-Id") String userId, @RequestBody Map<String, String> body) {
        String message = body.get("message");
        propertyService.submitInquiry(id, userId, message);
        return ResponseEntity.ok().build();
    }
}
