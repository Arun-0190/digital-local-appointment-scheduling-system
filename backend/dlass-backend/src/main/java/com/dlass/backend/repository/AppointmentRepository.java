package com.dlass.backend.repository;

import com.dlass.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByProviderIdAndDate(String providerId, LocalDate date);
    List<Appointment> findByUserId(String userId);
    long countByProviderId(String providerId);
    long countByProviderIdAndDate(String providerId, LocalDate date);
    long countByProviderIdAndDateAfter(String providerId, LocalDate date);
    List<Appointment> findByProviderId(String providerId);
    boolean existsByProviderIdAndDateAndStartTime(String providerId, LocalDate date, LocalTime startTime);

}