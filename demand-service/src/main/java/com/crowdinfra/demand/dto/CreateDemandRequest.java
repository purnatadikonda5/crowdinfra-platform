package com.crowdinfra.demand.dto;

import com.crowdinfra.demand.model.Location;
import lombok.Data;

@Data
public class CreateDemandRequest {
    private String title;
    private String description;
    private String category;
    private Location location;
    private String userName;
}
