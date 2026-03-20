package com.dlass.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dlass.backend.dto.ProviderProfileResponse;
import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.dto.ProviderApplicationRequest;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.service.ServiceProviderService;

@RestController
@RequestMapping("/api/providers")
public class ServiceProviderController {

    private final ServiceProviderService service;

    public ServiceProviderController(ServiceProviderService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ServiceProvider register(
            @RequestBody ServiceProvider provider,
            Authentication authentication) {

        String email = authentication.getName();

        return service.register(provider, email);
    }

    @PostMapping("/apply")
    public ServiceProvider applyAsProvider(@RequestBody ProviderApplicationRequest request) {
        return service.applyAsProvider(request);
    }

    @GetMapping("/by-subcategory/{id}")
    public List<ServiceProvider> getBySubCategory(@PathVariable String id) {
        return service.getBySubCategory(id);
    }

    @GetMapping("/search")
    public List<ProviderSearchResponse> searchProviders(
            @RequestParam String categoryId,
            @RequestParam String subCategoryId,
            @RequestParam String pincode) {

        return service.searchProviders(categoryId, subCategoryId, pincode)
                .stream()
                .map(p -> new ProviderSearchResponse(
                        p.getId(),
                        p.getBusinessName(),
                        p.getArea(),
                        p.getCity(),
                        p.getPincode(),
                        p.getExperienceYears(),
                        p.getRating(),
                        p.getReviewCount()
                ))
                .toList();
    }

    @GetMapping("/{providerId}/profile")
    public ProviderProfileResponse getProviderProfile(
        @PathVariable String providerId) {
        return service.getProviderProfile(providerId);
    }

}