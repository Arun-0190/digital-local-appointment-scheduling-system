package com.dlass.backend.repository;

import com.dlass.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    /** Weekly analytics: appointments in a date range */
    List<Appointment> findByDateBetween(LocalDate from, LocalDate to);
    long countByDateBetween(LocalDate from, LocalDate to);

    /** Appointments within a createdAt range */
    List<Appointment> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /** Analytics: provider-scoped date range queries */
    List<Appointment> findByProviderIdAndDateBetween(String providerId, LocalDate from, LocalDate to);

    /** Analytics: provider + status filter */
    List<Appointment> findByProviderIdAndStatus(String providerId, String status);

    /** Analytics: provider + status + date range */
    List<Appointment> findByProviderIdAndStatusAndDateBetween(
            String providerId, String status, LocalDate from, LocalDate to);
}
