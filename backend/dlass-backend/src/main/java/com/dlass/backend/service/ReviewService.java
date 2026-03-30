package com.dlass.backend.service;

import com.dlass.backend.model.*;
import com.dlass.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            AppointmentRepository appointmentRepository,
            ServiceProviderRepository providerRepository, UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
    }

    public Review addReview(String email, Review review) {

        Appointment appointment = appointmentRepository
                .findById(review.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        //Rule 1: Only booking user can review
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!appointment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only review your own appointment");
        }

        //Rule 2: Appointment must be completed
        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new RuntimeException("You can only review after appointment is completed");
        }

        //Rule 3: Only one review per appointment
        if (reviewRepository.existsByAppointmentId(review.getAppointmentId())) {
            throw new RuntimeException("Review already submitted for this appointment");
        }

        ServiceProvider provider = providerRepository
                .findById(appointment.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        review.setProviderId(provider.getId());
        review.setUserId(user.getId());
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        updateProviderRating(provider, review.getRating());

        return savedReview;
    }

    private void updateProviderRating(ServiceProvider provider, int newRating) {

        double oldRating = provider.getRating();
        int reviewCount = provider.getReviewCount();

        double updatedRating =
                ((oldRating * reviewCount) + newRating) / (reviewCount + 1);

        provider.setRating(updatedRating);
        provider.setReviewCount(reviewCount + 1);

        providerRepository.save(provider);
    }

    public List<Review> getProviderReviews(String providerId) {
        return reviewRepository.findByProviderId(providerId);
    }

    public Review replyToReview(String reviewId, String replyText, String providerEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        User providerUser = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        ServiceProvider provider = providerRepository.findByUserId(providerUser.getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));
                
        if (!review.getProviderId().equals(provider.getId())) {
            throw new RuntimeException("You can only reply to reviews for your own services");
        }
        
        review.setReply(replyText);
        return reviewRepository.save(review);
    }
}