package com.dlass.backend.repository;

import com.dlass.backend.model.ServiceProvider;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends MongoRepository<ServiceProvider, String> {

    @Query("{ 'subCategoryId': ?0, 'status': ?1, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<ServiceProvider> findBySubCategoryIdAndStatus(String subCategoryId, String status);

    @Query("{ 'userId': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    Optional<ServiceProvider> findByUserId(String userId);

    boolean existsByUserId(String userId);

    @Query("{ 'pincode': { $regex: '^?0' }, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<ServiceProvider> findByPincodeStartingWith(String prefix);

    @Query("{ 'status': ?0, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<ServiceProvider> findByStatus(String status);

    @Query("{ 'categoryId': ?0, 'subCategoryId': ?1, 'status': ?2, $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] }")
    List<ServiceProvider> findByCategoryIdAndSubCategoryIdAndStatus(String categoryId, String subCategoryId, String status);

    /** Soft-delete aware — also matches old docs where field doesn't exist */
    @Query("{ 'isActive': { $ne: false }, 'active': { $ne: false }, 'enabled': { $ne: false }, 'isDeleted': { $ne: true } }")
    List<ServiceProvider> findByIsActiveTrue();

    @Query("{ 'status': ?0, 'isActive': { $ne: false }, 'active': { $ne: false }, 'enabled': { $ne: false }, 'isDeleted': { $ne: true } }")
    List<ServiceProvider> findByStatusAndIsActiveTrue(String status);

    /** Active providers for search */
    @Query("{ 'subCategoryId': ?0, 'status': ?1, $and: [ { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<ServiceProvider> findBySubCategoryIdAndStatusAndIsActiveTrue(String subCategoryId, String status);

    @Query("{ 'categoryId': ?0, 'subCategoryId': ?1, 'status': ?2, $and: [ { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<ServiceProvider> findByCategoryIdAndSubCategoryIdAndStatusAndIsActiveTrue(
            String categoryId, String subCategoryId, String status);

    /** Weekly stats: active providers created between dates */
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 }, $and: [ { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }")
    List<ServiceProvider> findByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    @Query(value = "{ 'createdAt': { $gte: ?0, $lte: ?1 }, $and: [ { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } } ] }, { $or: [ { 'isDeleted': false }, { 'isDeleted': { $exists: false } } ] } ] }", count = true)
    long countByCreatedAtBetweenAndIsActiveTrue(LocalDateTime from, LocalDateTime to);

    @Query("{ $or: [ { 'isDeleted': true }, { 'isActive': false } ] }")
    List<ServiceProvider> findDeletedProviders();
}