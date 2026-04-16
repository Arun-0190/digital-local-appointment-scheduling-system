package com.dlass.backend.repository;

import com.dlass.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    @Query("{ 'email': ?0, 'isDeleted': { $ne: true } }")
    Optional<User> findByEmail(String email);

    @Query("{ 'email': ?0, 'isDeleted': { $ne: true } }")
    Optional<User> findByEmailAndIsActiveTrue(String email);

    @Query("{ 'role': ?0, 'isDeleted': { $ne: true } }")
    List<User> findByRole(String role);

    @Query("{ 'role': ?0, 'isDeleted': { $ne: true } }")
    List<User> findByRoleAndIsActiveTrue(String role);

    @Query("{ 'isActive': { $ne: false }, 'active': { $ne: false }, 'enabled': { $ne: false }, 'isDeleted': { $ne: true } }")
    List<User> findByIsActiveTrue();

    /** Active users created in a time range (for weekly stats) */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, 'isDeleted': { $ne: true } }")
    List<User> findByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    /** Count active users created between dates */
    @Query(value = "{ 'createdAt': { $gte: ?0, $lte: ?1 }, 'isDeleted': { $ne: true } }", count = true)
    long countByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    @Query("{ $or: [ { 'isDeleted': true }, { 'isActive': false } ] }")
    List<User> findDeletedUsers();
}
