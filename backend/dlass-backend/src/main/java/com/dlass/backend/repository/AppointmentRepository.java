package com.dlass.backend.repository;

import com.dlass.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    @Query("{ 'providerId': ?0, 'date': ?1, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndDate(String providerId, LocalDate date);

    @Query("{ 'userId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByUserId(String userId);

    @Query(value = "{ 'providerId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderId(String providerId);

    @Query(value = "{ 'providerId': ?0, 'date': ?1, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderIdAndDate(String providerId, LocalDate date);

    @Query(value = "{ 'providerId': ?0, 'date': { $gt: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderIdAndDateAfter(String providerId, LocalDate date);

    @Query("{ 'providerId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderId(String providerId);

    @Query(value = "{ 'providerId': ?0, 'date': ?1, 'startTime': ?2, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", exists = true)
    boolean existsByProviderIdAndDateAndStartTime(String providerId, LocalDate date, LocalTime startTime);

    /** Weekly analytics: appointments in a date range */
    @Query("{ 'date': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByDateBetween(LocalDate from, LocalDate to);

    @Query(value = "{ 'date': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByDateBetween(LocalDate from, LocalDate to);

    /** Appointments within a createdAt range */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /** Analytics: provider-scoped date range queries */
    @Query("{ 'providerId': ?0, 'date': { $gte: ?1, $lte: ?2 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndDateBetween(String providerId, LocalDate from, LocalDate to);

    /** Analytics: provider + status filter */
    @Query("{ 'providerId': ?0, 'status': ?1, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndStatus(String providerId, String status);

    /** Analytics: provider + status + date range */
    @Query("{ 'providerId': ?0, 'status': ?1, 'date': { $gte: ?2, $lte: ?3 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndStatusAndDateBetween(
            String providerId, String status, LocalDate from, LocalDate to);
}
