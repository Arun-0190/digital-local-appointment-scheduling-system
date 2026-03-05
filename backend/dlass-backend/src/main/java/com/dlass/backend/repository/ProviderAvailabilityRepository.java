package com.dlass.backend.repository;

import com.dlass.backend.model.ProviderAvailability;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface ProviderAvailabilityRepository extends MongoRepository<ProviderAvailability, String> {

    List<ProviderAvailability> findByProviderId(String providerId);

    List<ProviderAvailability> findByProviderIdAndDayOfWeek(
            String providerId,
            DayOfWeek dayOfWeek
    );
}