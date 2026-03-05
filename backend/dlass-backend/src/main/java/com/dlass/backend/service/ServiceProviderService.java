package com.dlass.backend.service;

import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceProviderService {

    private final ServiceProviderRepository repository;
    private final UserRepository userRepository;

    public ServiceProviderService(ServiceProviderRepository repository,
                                  UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
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

}