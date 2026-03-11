package com.dlass.backend.repository;

import com.dlass.backend.model.ServiceOffering;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface ServiceOfferingRepository extends MongoRepository<ServiceOffering, String> {

    List<ServiceOffering> findByProviderId(String providerId);
    Optional<ServiceOffering> findByIdAndProviderId(String id, String providerId);

}