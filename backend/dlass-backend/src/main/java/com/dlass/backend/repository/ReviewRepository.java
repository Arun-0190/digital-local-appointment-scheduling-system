package com.dlass.backend.repository;

import com.dlass.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByProviderId(String providerId);

    boolean existsByAppointmentId(String appointmentId);
}