package com.crowdinfra.demand.repository;

import com.crowdinfra.demand.model.Demand;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Box;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class DemandRepositoryCustomImpl implements DemandRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Demand> findDemandsWithFilters(Demand.Category category, Demand.Status status, Double lat, Double lng, Double radiusInMeters, Pageable pageable) {
        Query query = new Query();

        if (category != null) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (lat != null && lng != null && radiusInMeters != null) {
            // MongoDB $near query using maxDistance in meters (requires 2dsphere index)
            query.addCriteria(Criteria.where("location").nearSphere(new Point(lng, lat)).maxDistance(radiusInMeters));
        }

        long count = mongoTemplate.count(query, Demand.class);
        query.with(pageable);
        List<Demand> demands = mongoTemplate.find(query, Demand.class);

        return new PageImpl<>(demands, pageable, count);
    }

    @Override
    public List<Demand> findWithinBoundingBox(double minLat, double maxLat, double minLng, double maxLng) {
        Query query = new Query();
        // Box is defined by bottom-left and top-right points (lng, lat)
        Point bottomLeft = new Point(minLng, minLat);
        Point topRight = new Point(maxLng, maxLat);
        
        query.addCriteria(Criteria.where("location").within(new Box(bottomLeft, topRight)));
        return mongoTemplate.find(query, Demand.class);
    }
}
