package com.crowdinfra.property.dto;

import com.crowdinfra.property.model.Location;
import lombok.Data;

@Data
public class CreatePropertyRequest {
    private String title;
    private String description;
    private String category;
    private String listingType;
    private String ownerName;
    private String contactNumber;
    private Location location;
    private Double price;
    private Double areaSqft;
}
