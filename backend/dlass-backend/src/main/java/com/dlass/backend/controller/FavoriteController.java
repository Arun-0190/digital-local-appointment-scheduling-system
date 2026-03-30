package com.dlass.backend.controller;

import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.model.Favorite;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.FavoriteRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;

    public FavoriteController(FavoriteRepository favoriteRepository,
                              UserRepository userRepository,
                              ServiceProviderRepository providerRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/{providerId}")
    public ResponseEntity<String> addFavorite(@PathVariable String providerId, Authentication auth) {
        User user = getUser(auth);

        // Prevent duplicates
        if (favoriteRepository.findByUserIdAndProviderId(user.getId(), providerId).isEmpty()) {
            favoriteRepository.save(new Favorite(user.getId(), providerId));
            return ResponseEntity.ok("Added to favorites");
        }
        return ResponseEntity.ok("Already in favorites");
    }

    @DeleteMapping("/{providerId}")
    public ResponseEntity<String> removeFavorite(@PathVariable String providerId, Authentication auth) {
        User user = getUser(auth);
        favoriteRepository.deleteByUserIdAndProviderId(user.getId(), providerId);
        return ResponseEntity.ok("Removed from favorites");
    }

    @GetMapping
    public List<ProviderSearchResponse> getFavorites(Authentication auth) {
        User user = getUser(auth);
        List<Favorite> favorites = favoriteRepository.findByUserId(user.getId());

        List<String> providerIds = favorites.stream()
                .map(Favorite::getProviderId)
                .collect(Collectors.toList());

        return ((List<ServiceProvider>) providerRepository.findAllById(providerIds))
                .stream()
                .filter(p -> p.isActive() && !p.isDeleted())
                .map(p -> new ProviderSearchResponse(
                        p.getId(),
                        p.getBusinessName(),
                        p.getArea(),
                        p.getCity(),
                        p.getPincode(),
                        p.getExperienceYears(),
                        p.getRating(),
                        p.getReviewCount(),
                        p.getServices()
                ))
                .collect(Collectors.toList());
    }
}
