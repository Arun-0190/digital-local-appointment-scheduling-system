package com.dlass.backend.controller;

import com.dlass.backend.model.Review;
import com.dlass.backend.service.ReviewService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping
    public Review addReview(
            @RequestBody Review review,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return service.addReview(email, review);
    }

    @GetMapping("/provider/{providerId}")
    public List<Review> getProviderReviews(@PathVariable String providerId) {
        return service.getProviderReviews(providerId);
    }
}