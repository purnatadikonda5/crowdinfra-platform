package com.crowdinfra.property.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "properties")
public class Property {
    @Id
    private String id;
    
    private String title;
    private String description;
    
    @Indexed
    private String category; // COMMERCIAL | RESIDENTIAL | LAND | INDUSTRIAL
    
    @Indexed
    private String listingType; // SELL | RENT | LEASE
    
    @Indexed
    private String ownerId; // from X-User-Id
    
    private String ownerName; // denormalized
    private String contactNumber;
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
    
    private String address;
    
    @Builder.Default
    private List<String> images = new ArrayList<>();
    
    @Builder.Default
    private int nearbyDemandCount = 0;
    
    private Double price;
    private Double areaSqft;
    
    @Indexed
    private String status; // AVAILABLE | SOLD | RENTED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
