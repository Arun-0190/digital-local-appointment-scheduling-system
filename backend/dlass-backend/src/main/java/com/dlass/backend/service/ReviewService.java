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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rule 1: Only regular users can review
        if (!"USER".equals(user.getRole())) {
            throw new RuntimeException("Only regular users can provide reviews");
        }

        Appointment appointment = appointmentRepository
                .findById(review.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Rule 2: Appointment must belong to the user
        if (!appointment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You can only review your own appointments");
        }

        // Rule 3: Appointment must be completed
        if (!"COMPLETED".equals(appointment.getStatus())) {
            throw new RuntimeException("You can only review after the appointment is completed");
        }

        // Rule 4: Only one review per appointment
        if (reviewRepository.existsByAppointmentId(appointment.getId())) {
            throw new RuntimeException("You have already reviewed this appointment");
        }

        // Rule 5: Review window (24 hours after completion)
        LocalDateTime completionTime = LocalDateTime.of(appointment.getDate(), appointment.getEndTime());
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(completionTime.plusHours(24))) {
            throw new RuntimeException("The review window for this appointment has expired (24 hours)");
        }
        
        if (now.isBefore(completionTime)) {
            throw new RuntimeException("You cannot review an appointment before its scheduled completion time");
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