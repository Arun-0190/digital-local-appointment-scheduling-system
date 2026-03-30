package com.dlass.backend.repository;

import com.dlass.backend.model.PlatformConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformConfigRepository extends MongoRepository<PlatformConfig, String> {
}
