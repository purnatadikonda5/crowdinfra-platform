package com.crowdinfra.property.repository;

import com.crowdinfra.property.model.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String>, PropertyRepositoryCustom {
    List<Property> findByOwnerId(String ownerId);
}
