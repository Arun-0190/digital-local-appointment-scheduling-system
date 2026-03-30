package com.dlass.backend.repository;

import com.dlass.backend.model.SlotLock;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SlotLockRepository extends MongoRepository<SlotLock, String> {
    Optional<SlotLock> findByProviderIdAndDateAndStartTime(String providerId, LocalDate date, LocalTime startTime);
    void deleteByExpiresAtBefore(LocalDateTime now);
    void deleteByProviderIdAndDateAndStartTime(String providerId, LocalDate date, LocalTime startTime);
}
