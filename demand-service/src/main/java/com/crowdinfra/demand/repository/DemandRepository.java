package com.crowdinfra.demand.repository;

import com.crowdinfra.demand.model.Demand;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandRepository extends MongoRepository<Demand, String> {
    List<Demand> findByUserId(String userId);
}
