package com.dlass.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.dlass.backend.dto.ProviderProfileResponse;
import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.dto.ProviderApplicationRequest;
import com.dlass.backend.dto.ServiceDTO;
import com.dlass.backend.dto.TimeSlotDTO;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.service.ServiceProviderService;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "http://localhost:5173")
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
    public ServiceProvider applyAsProvider(
            @RequestBody ProviderApplicationRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return service.applyAsProvider(request, email);
    }

    @GetMapping("/by-subcategory/{id}")
    public List<ServiceProvider> getBySubCategory(@PathVariable String id) {
        return service.getBySubCategory(id);
    }

    @GetMapping("/search")
    public List<ProviderSearchResponse> searchProviders(
            @RequestParam String categoryId,
            @RequestParam String subCategoryId,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String city) {

        return service.searchProviders(categoryId, subCategoryId, pincode, city)
                .stream()
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
                .toList();
    }

    @GetMapping("/{providerId}/profile")
    public ProviderProfileResponse getProviderProfile(
        @PathVariable String providerId) {
        return service.getProviderProfile(providerId);
    }

    /** List all active service offerings for a provider (public) */
    @GetMapping("/{providerId}/services")
    public List<ServiceDTO> getProviderServices(@PathVariable String providerId) {
        return service.getServiceOfferings(providerId);
    }

    /**
     * Generate available time slots for a specific service on a given date.
     * Uses the service duration (not a fixed slot size) and removes already-booked slots.
     */
    @GetMapping("/{providerId}/slots")
    public List<Map<String, String>> getAvailableSlots(
            @PathVariable String providerId,
            @RequestParam String serviceId,
            @RequestParam LocalDate date) {
        return service.getAvailableSlots(providerId, serviceId, date);
    }

    @PostMapping("/services")
    public com.dlass.backend.model.ServiceOffering addService(
            @RequestBody com.dlass.backend.model.ServiceOffering serviceOffering,
            Authentication authentication) {
        String email = authentication.getName();
        return service.addServiceOffering(email, serviceOffering);
    }

}