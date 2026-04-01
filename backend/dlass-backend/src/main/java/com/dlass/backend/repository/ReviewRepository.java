package com.dlass.backend.repository;

import com.dlass.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByProviderId(String providerId);

    void deleteByProviderId(String providerId);
    long countByProviderId(String providerId);
    boolean existsByAppointmentId(String appointmentId);

    boolean existsByProviderIdAndUserId(String providerId, String userId);
}