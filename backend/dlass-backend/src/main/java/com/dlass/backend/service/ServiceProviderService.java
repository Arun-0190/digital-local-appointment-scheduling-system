package com.dlass.backend.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dlass.backend.dto.ProviderProfileResponse;
import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.dto.ServiceDTO;
import com.dlass.backend.model.Review;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ReviewRepository;
import com.dlass.backend.repository.ServiceOfferingRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.dto.ProviderApplicationRequest;

@Service
public class ServiceProviderService {

    private final ServiceProviderRepository repository;
    private final UserRepository userRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ReviewRepository reviewRepository;

    public ServiceProviderService(ServiceProviderRepository repository,
                                  UserRepository userRepository, ServiceOfferingRepository serviceOfferingRepository, ReviewRepository reviewRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.reviewRepository = reviewRepository;
    }

    public ServiceProvider register(ServiceProvider provider, String email) {

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if(repository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Provider profile already exists");
        }

        provider.setUserId(user.getId());

        provider.setStatus("PENDING");
        provider.setCreatedAt(LocalDateTime.now());
        provider.setUpdatedAt(LocalDateTime.now());

        return repository.save(provider);
    }

    public ServiceProvider applyAsProvider(ProviderApplicationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(repository.findByUserId(user.getId()).isPresent()) {
             throw new RuntimeException("Provider profile already exists or pending");
        }

        ServiceProvider provider = new ServiceProvider();
        provider.setUserId(user.getId());
        provider.setBusinessName(request.getBusinessName());
        provider.setDescription(request.getDescription());
        provider.setCategoryId(request.getCategoryId());
        provider.setSubCategoryId(request.getSubCategoryId());
        provider.setServices(request.getServices());
        provider.setExperienceYears(request.getExperienceYears());
        provider.setCity(request.getCity());
        provider.setArea(request.getArea());
        provider.setPincode(request.getPincode());
        provider.setStatus("PENDING");
        provider.setCreatedAt(LocalDateTime.now());
        provider.setUpdatedAt(LocalDateTime.now());
        provider.setRating(0);
        provider.setReviewCount(0);

        return repository.save(provider);
    }

    public List<ServiceProvider> getPendingProviders() {
        return repository.findByStatus("PENDING");
    }

    public List<ServiceProvider> getBySubCategory(String subCategoryId) {
        return repository.findBySubCategoryIdAndStatus(subCategoryId, "ACTIVE");
    }

    public ServiceProvider approve(String id) {

        ServiceProvider provider = repository.findById(id).orElseThrow(() -> new RuntimeException("Provider not found"));

        provider.setStatus("ACTIVE");

        User user = userRepository.findById(provider.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole("PROVIDER");

        userRepository.save(user);

        return repository.save(provider);
    }

    public ServiceProvider reject(String id) {
        ServiceProvider provider = repository.findById(id).orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setStatus("SUSPENDED");
        return repository.save(provider);
    }

    public List<ServiceProvider> searchProviders(String categoryId, String subCategoryId, String userPincode) {

        List<ServiceProvider> providers = repository.findByCategoryIdAndSubCategoryIdAndStatus(categoryId, subCategoryId, "ACTIVE");

        return providers.stream()
                .sorted((p1, p2) -> {

                    int score1 = calculateScore(p1, userPincode);
                    int score2 = calculateScore(p2, userPincode);

                    return Integer.compare(score2, score1); // higher score first
                })
                .toList();
    }

    public ProviderProfileResponse getProviderProfile(String providerId) {
        ServiceProvider provider = repository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Provider not found"));
        List<ServiceDTO> services = serviceOfferingRepository.findByProviderId(providerId)
                                        .stream().map(s -> new ServiceDTO(
                                            s.getId(),
                                            s.getName(),
                                            s.getDuration(),
                                            s.getPrice()
                                        )).toList();
                                        
        List<Review> reviews =
            reviewRepository.findByProviderId(providerId);
        return new ProviderProfileResponse(provider, services, reviews);
    }

    private int calculateScore(ServiceProvider provider, String userPincode) {

        int providerPin = Integer.parseInt(provider.getPincode());
        int userPin = Integer.parseInt(userPincode);

        int distanceDiff = Math.abs(providerPin - userPin);

        int distanceScore = Math.max(0, 100 - distanceDiff);

        int ratingScore = (int) (provider.getRating() * 20);

        int reviewScore = provider.getReviewCount() * 2;

        return distanceScore + ratingScore + reviewScore;
    }

}