package com.dlass.backend.service;

import com.dlass.backend.model.ServiceOffering;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ServiceOfferingRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServiceOfferingService {

    private final ServiceOfferingRepository repository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;

    public ServiceOfferingService(ServiceOfferingRepository repository,
                                  UserRepository userRepository,
                                  ServiceProviderRepository serviceProviderRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
    }

    public ServiceOffering create(ServiceOffering service, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        service.setProviderId(provider.getId());
        service.setCreatedAt(LocalDateTime.now());
        service.setUpdatedAt(LocalDateTime.now());

        return repository.save(service);
    }

    public ServiceOffering updateService(String serviceId, ServiceOffering updatedService, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ServiceOffering existing = repository
                .findByIdAndProviderId(serviceId, provider.getId())
                .orElseThrow(() -> new RuntimeException("Service not found or not owned by provider"));

        existing.setName(updatedService.getName());
        existing.setDescription(updatedService.getDescription());
        existing.setDuration(updatedService.getDuration());
        existing.setPrice(updatedService.getPrice());
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    public void deleteService(String serviceId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        ServiceOffering service = repository
                .findByIdAndProviderId(serviceId, provider.getId())
                .orElseThrow(() -> new RuntimeException("Service not found or not owned by provider"));

        repository.delete(service);
    }

    public List<ServiceOffering> getProviderServices(String providerId) {

        return repository.findByProviderId(providerId);
    }

    public List<ServiceOffering> getMyServices(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        return repository.findByProviderId(provider.getId());
    }

}