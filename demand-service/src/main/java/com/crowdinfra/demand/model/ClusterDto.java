package com.crowdinfra.demand.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClusterDto {
    private double lat;
    private double lng;
    private int weight; // useful for heatmaps
}
