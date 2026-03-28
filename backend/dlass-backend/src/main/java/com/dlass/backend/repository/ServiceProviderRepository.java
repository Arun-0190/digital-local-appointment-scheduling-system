package com.dlass.backend.repository;

import com.dlass.backend.model.ServiceProvider;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends MongoRepository<ServiceProvider, String> {

    List<ServiceProvider> findBySubCategoryIdAndStatus(String subCategoryId, String status);

    Optional<ServiceProvider> findByUserId(String userId);

    List<ServiceProvider> findByPincodeStartingWith(String prefix);

    List<ServiceProvider> findByStatus(String status);

    List<ServiceProvider> findByCategoryIdAndSubCategoryIdAndStatus(String categoryId, String subCategoryId, String status);

    /** Soft-delete aware — also matches old docs where field doesn't exist */
    @Query("{ $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }")
    List<ServiceProvider> findByIsActiveTrue();

    /** Active providers by status */
    @Query("{ 'status': ?0, $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }")
    List<ServiceProvider> findByStatusAndIsActiveTrue(String status);

    /** Active providers for search */
    @Query("{ 'subCategoryId': ?0, 'status': ?1, $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }")
    List<ServiceProvider> findBySubCategoryIdAndStatusAndIsActiveTrue(String subCategoryId, String status);

    @Query("{ 'categoryId': ?0, 'subCategoryId': ?1, 'status': ?2, $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }")
    List<ServiceProvider> findByCategoryIdAndSubCategoryIdAndStatusAndIsActiveTrue(
            String categoryId, String subCategoryId, String status);

    /** Weekly stats: active providers created between dates */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }")
    List<ServiceProvider> findByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    @Query(value = "{ 'createdAt': { $gte: ?0, $lte: ?1 }, $or: [ { 'isActive': true }, { 'active': true }, { 'isActive': { $exists: false }, 'active': { $exists: false } } ] }", count = true)
    long countByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);
}