package com.dlass.backend.repository;

import com.dlass.backend.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId);
    Optional<Favorite> findByUserIdAndProviderId(String userId, String providerId);
    void deleteByUserIdAndProviderId(String userId, String providerId);
}
