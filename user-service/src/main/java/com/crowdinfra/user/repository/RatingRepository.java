package com.crowdinfra.user.repository;

import com.crowdinfra.user.model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends MongoRepository<Rating, String> {
    Optional<Rating> findByUserId(String userId);
}
