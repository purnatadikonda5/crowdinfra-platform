package com.crowdinfra.property.repository;

import com.crowdinfra.property.model.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PropertyRepositoryCustomImpl implements PropertyRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    @Override
    public Page<Property> searchProperties(String category, String listingType, Double minPrice, Double maxPrice, Pageable pageable) {
        Query query = new Query();

        if (category != null && !category.isEmpty()) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (listingType != null && !listingType.isEmpty()) {
            query.addCriteria(Criteria.where("listingType").is(listingType));
        }
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) priceCriteria.gte(minPrice);
            if (maxPrice != null) priceCriteria.lte(maxPrice);
            query.addCriteria(priceCriteria);
        }

        long count = mongoTemplate.count(query, Property.class);
        query.with(pageable);
        List<Property> properties = mongoTemplate.find(query, Property.class);

        return new PageImpl<>(properties, pageable, count);
    }

    @Override
    public List<Property> findPropertiesNear(Double lat, Double lng, Double radiusInMeters) {
        Query query = new Query();
        // $near query requires 2dsphere index which we added to Property.location
        query.addCriteria(Criteria.where("location").nearSphere(new Point(lng, lat)).maxDistance(radiusInMeters));
        return mongoTemplate.find(query, Property.class);
    }
}
