package com.crowdinfra.property.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreatePropertyRequest {
    private String title;
    private String description;
    private String category;
    private String listingType;
    private String ownerName;
    private String contactNumber;
    private Double lat;
    private Double lng;
    private String address;
    private List<String> images;
    private Double price;
    private Double areaSqft;
}
