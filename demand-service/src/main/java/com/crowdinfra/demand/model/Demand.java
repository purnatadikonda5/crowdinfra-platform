package com.crowdinfra.demand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "demands")
public class Demand {
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    private Category category;
    
    private Status status;
    
    private String userId; // required
    
    private String userName; // denormalized
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
    
    private String address;
    
    @Builder.Default
    private List<String> images = new ArrayList<>();
    
    @Builder.Default
    private int viewCount = 0;
    
    @Builder.Default
    private int upvoteCount = 0;
    
    @Builder.Default
    private List<String> upvotedBy = new ArrayList<>();
    
    private String aiAnalysis; // cached Gemini response JSON
    
    private LocalDateTime aiAnalyzedAt;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    public enum Category {
        INFRASTRUCTURE, HEALTHCARE, EDUCATION, TRANSPORTATION, UTILITIES, PUBLIC_SERVICE, OTHER
    }

    public enum Status {
        PENDING, FULFILLED
    }
}
