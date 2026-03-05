package com.dlass.backend.repository;

import com.dlass.backend.model.ServiceProvider;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends MongoRepository<ServiceProvider, String> {

    List<ServiceProvider> findBySubCategoryIdAndStatus(String subCategoryId, String status);
    Optional<ServiceProvider> findByUserId(String userId);

}