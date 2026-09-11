package com.crowdinfra.demand.repository;

import com.crowdinfra.demand.model.Demand;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandRepository extends MongoRepository<Demand, String>, DemandRepositoryCustom {
}
