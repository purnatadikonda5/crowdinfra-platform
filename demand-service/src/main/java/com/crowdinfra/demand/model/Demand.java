package com.crowdinfra.demand.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
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
    
    @Indexed
    private String category; // INFRASTRUCTURE|HEALTHCARE|EDUCATION|TRANSPORT|UTILITIES|PUBLIC
    
    @Indexed
    private String status; // PENDING | FULFILLED
    
    @Indexed
    private String userId; // from X-User-Id
    
    private String userName; // denormalized snapshot
    
    private Location location;
    
    private int upvoteCount;
    private List<String> upvotedBy; // userId list
    
    private int commentCount;
    private int viewCount;
    
    private String aiAnalysis; // cached Gemini response JSON
    private LocalDateTime aiAnalyzedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
