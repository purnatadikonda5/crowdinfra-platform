package com.crowdinfra.user.controller;

import com.crowdinfra.user.model.Rating;
import com.crowdinfra.user.repository.RatingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class RatingController {

    private final RatingRepository ratingRepository;

    public RatingController(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    @PostMapping("/rating")
    public ResponseEntity<Rating> submitRating(@RequestHeader("X-User-Id") String userId, @RequestBody Rating request) {
        Optional<Rating> existingRating = ratingRepository.findByUserId(userId);
        Rating rating;
        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setRating(request.getRating());
            rating.setReview(request.getReview());
        } else {
            rating = Rating.builder()
                    .userId(userId)
                    .rating(request.getRating())
                    .review(request.getReview())
                    .build();
        }
        return ResponseEntity.ok(ratingRepository.save(rating));
    }

    @GetMapping("/ratings")
    public ResponseEntity<List<Rating>> getAllRatings() {
        return ResponseEntity.ok(ratingRepository.findAll());
    }
}
