package com.crowdinfra.property.service;

import com.crowdinfra.property.model.Property;
import com.crowdinfra.property.repository.PropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Optional<Property> getPropertyById(String id) {
        return propertyRepository.findById(id);
    }

    public List<Property> getPropertiesByOwnerId(String ownerId) {
        return propertyRepository.findByOwnerId(ownerId);
    }

    public Property createProperty(Property property, String ownerId) {
        property.setOwnerId(ownerId);
        property.setStatus("AVAILABLE");
        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());
        
        log.info("Creating property for owner {}", ownerId);
        return propertyRepository.save(property);
    }

    public Property updateProperty(String id, Property updatedProperty, String ownerId) {
        return propertyRepository.findById(id).map(property -> {
            if (!property.getOwnerId().equals(ownerId)) {
                throw new RuntimeException("Unauthorized: Not the owner");
            }
            if (updatedProperty.getTitle() != null) property.setTitle(updatedProperty.getTitle());
            if (updatedProperty.getDescription() != null) property.setDescription(updatedProperty.getDescription());
            if (updatedProperty.getCategory() != null) property.setCategory(updatedProperty.getCategory());
            if (updatedProperty.getListingType() != null) property.setListingType(updatedProperty.getListingType());
            if (updatedProperty.getPrice() != null) property.setPrice(updatedProperty.getPrice());
            if (updatedProperty.getAreaSqft() != null) property.setAreaSqft(updatedProperty.getAreaSqft());
            if (updatedProperty.getLocation() != null) property.setLocation(updatedProperty.getLocation());
            if (updatedProperty.getAddress() != null) property.setAddress(updatedProperty.getAddress());
            if (updatedProperty.getImages() != null) property.setImages(updatedProperty.getImages());
            if (updatedProperty.getContactNumber() != null) property.setContactNumber(updatedProperty.getContactNumber());
            
            property.setUpdatedAt(LocalDateTime.now());
            return propertyRepository.save(property);
        }).orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public void deleteProperty(String id, String ownerId, String userRole) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
                
        if (!property.getOwnerId().equals(ownerId) && !"ADMIN".equals(userRole)) {
            throw new RuntimeException("Unauthorized");
        }
        
        propertyRepository.delete(property);
        log.info("Deleted property {}", id);
    }

    public Property updateStatus(String id, String status, String ownerId) {
        return propertyRepository.findById(id).map(property -> {
            if (!property.getOwnerId().equals(ownerId)) {
                throw new RuntimeException("Unauthorized: Not the owner");
            }
            property.setStatus(status);
            property.setUpdatedAt(LocalDateTime.now());
            return propertyRepository.save(property);
        }).orElseThrow(() -> new RuntimeException("Property not found"));
    }
    
    public void submitInquiry(String id, String userId, String message) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        // Simulating sending an email/notification to the owner
        log.info(">>> INQUIRY ALARM <<< User {} wants to contact Owner {} regarding Property {}. Message: {}", 
                userId, property.getOwnerId(), property.getId(), message);
    }
}
