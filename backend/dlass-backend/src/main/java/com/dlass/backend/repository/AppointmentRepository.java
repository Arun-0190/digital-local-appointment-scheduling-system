package com.dlass.backend.repository;

import com.dlass.backend.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    @Query("{ 'providerId': ?0, 'date': { $gte: ?1, $lte: ?2 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndDateBetweenInternal(String providerId, LocalDateTime start, LocalDateTime end);

    default List<Appointment> findByProviderIdAndDate(String providerId, LocalDate date) {
        return findByProviderIdAndDateBetweenInternal(providerId, date.atStartOfDay(), date.atTime(LocalTime.MAX));
    }

    void deleteByProviderId(String providerId);

    @Query("{ 'userId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByUserId(String userId);

    @Query(value = "{ 'providerId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderId(String providerId);

    @Query(value = "{ 'providerId': ?0, 'date': { $gte: ?1, $lte: ?2 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderIdAndDateBetweenInternal(String providerId, LocalDateTime start, LocalDateTime end);

    default long countByProviderIdAndDate(String providerId, LocalDate date) {
        return countByProviderIdAndDateBetweenInternal(providerId, date.atStartOfDay(), date.atTime(LocalTime.MAX));
    }

    @Query(value = "{ 'providerId': ?0, 'date': { $gt: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByProviderIdAndDateAfterInternal(String providerId, LocalDateTime date);

    default long countByProviderIdAndDateAfter(String providerId, LocalDate date) {
        return countByProviderIdAndDateAfterInternal(providerId, date.atTime(LocalTime.MAX));
    }

    @Query("{ 'providerId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderId(String providerId);

    @Query(value = "{ 'providerId': ?0, 'date': { $gte: ?1, $lte: ?2 }, 'startTime': ?3, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", exists = true)
    boolean existsByProviderIdAndDateBetweenInternal(String providerId, LocalDateTime start, LocalDateTime end, LocalTime startTime);

    default boolean existsByProviderIdAndDateAndStartTime(String providerId, LocalDate date, LocalTime startTime) {
        return existsByProviderIdAndDateBetweenInternal(providerId, date.atStartOfDay(), date.atTime(LocalTime.MAX), startTime);
    }

    /** Weekly analytics range queries */
    @Query("{ 'date': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByDateBetweenInternal(LocalDateTime from, LocalDateTime to);

    default List<Appointment> findByDateBetween(LocalDate from, LocalDate to) {
        return findByDateBetweenInternal(from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    @Query(value = "{ 'date': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }", count = true)
    long countByDateBetweenInternal(LocalDateTime from, LocalDateTime to);

    default long countByDateBetween(LocalDate from, LocalDate to) {
        return countByDateBetweenInternal(from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    /** Appointments within a createdAt range */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /** Provider-scoped date range queries */
    default List<Appointment> findByProviderIdAndDateBetween(String providerId, LocalDate from, LocalDate to) {
        return findByProviderIdAndDateBetweenInternal(providerId, from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    /** Analytics: provider + status filter */
    @Query("{ 'providerId': ?0, 'status': ?1, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndStatus(String providerId, String status);

    /** Analytics: provider + status + date range */
    @Query("{ 'providerId': ?0, 'status': ?1, 'date': { $gte: ?2, $lte: ?3 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByProviderIdAndStatusAndDateBetweenInternal(
            String providerId, String status, LocalDateTime from, LocalDateTime to);

    default List<Appointment> findByProviderIdAndStatusAndDateBetween(String providerId, String status, LocalDate from, LocalDate to) {
        return findByProviderIdAndStatusAndDateBetweenInternal(providerId, status, from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }

    /** History: user-scoped, date range */
    @Query("{ 'userId': ?0, 'date': { $gte: ?1, $lte: ?2 }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<Appointment> findByUserIdAndDateBetweenInternal(String userId, LocalDateTime from, LocalDateTime to);

    default List<Appointment> findByUserIdAndDateBetween(String userId, LocalDate from, LocalDate to) {
        return findByUserIdAndDateBetweenInternal(userId, from.atStartOfDay(), to.atTime(LocalTime.MAX));
    }
}