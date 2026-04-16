package com.dlass.backend.repository;

import com.dlass.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    List<User> findByRole(String role);
    void deleteByRole(String role);

    @Query("{ 'email': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    Optional<User> findByEmail(String email);

    /** Only active users by email — also matches old docs where field doesn't exist */
    @Query("{ 'email': ?0, $and: [ { $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    Optional<User> findByEmailAndIsActiveTrue(String email);

    /** Active users by role (for admin user list) */
    @Query("{ 'role': ?0, $and: [ { $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<User> findByRoleAndIsActiveTrue(String role);

    /** All active users (for admin) */
    @Query("{ $and: [ { $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<User> findByIsActiveTrue();

    /** Active users created in a time range (for weekly stats) */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, $and: [ { $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<User> findByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    /** Count active users created between dates */
    @Query(value = "{ 'createdAt': { $gte: ?0, $lte: ?1 }, $and: [ { $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }", count = true)
    long countByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    @Query("{ $or: [ { 'isDeleted': true }, { 'isActive': false }, { 'active': false } ] }")
    List<User> findDeletedUsers();
}
