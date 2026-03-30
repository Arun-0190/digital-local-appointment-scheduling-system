package com.dlass.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

import com.dlass.backend.dto.PageResponse;
import com.dlass.backend.dto.ProfileUpdateRequest;
import com.dlass.backend.dto.ProviderProfileResponse;
import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.dto.ProviderApplicationRequest;
import com.dlass.backend.dto.ServiceDTO;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.service.ServiceProviderService;

import java.io.IOException;

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

    /** Returns the application status of the currently authenticated user. */
    @GetMapping("/my-status")
    public ResponseEntity<Map<String, String>> getMyStatus(Authentication authentication) {
        return ResponseEntity.ok(service.getMyStatus(authentication.getName()));
    }

    @GetMapping("/by-subcategory/{id}")
    public List<ServiceProvider> getBySubCategory(@PathVariable String id) {
        return service.getBySubCategory(id);
    }

    /**
     * Search providers with optional pagination + sorting.
     * Legacy callers that omit page/size get a PageResponse with all results on page 0.
     *
     * @param sort format "field,direction" e.g. "rating,desc" or "experience,asc"
     */
    @GetMapping("/search")
    public PageResponse<ProviderSearchResponse> searchProviders(
            @RequestParam String categoryId,
            @RequestParam String subCategoryId,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean availableToday,
            @RequestParam(required = false, defaultValue = "50") int range,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {

        String sortField = null;
        String sortDir = "desc";
        if (sort != null && sort.contains(",")) {
            String[] parts = sort.split(",", 2);
            sortField = parts[0].trim();
            sortDir = parts[1].trim();
        } else if (sort != null && !sort.isBlank()) {
            sortField = sort.trim();
        }

        return service.searchProvidersPageable(
                categoryId, subCategoryId, pincode, city, range,
                sortField, sortDir, minExperience, minRating, minPrice, maxPrice, availableToday, page, size);
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

    /** Delete a provider (admin). */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProvider(@PathVariable String id) {
        service.deleteProvider(id);
        return ResponseEntity.ok("Provider deleted");
    }

    // ── Feature 4: Profile Management ────────────────────────────────────────

    /** Update the authenticated provider's own profile (phone, city, area, pincode). */
    @PutMapping("/profile")
    public ResponseEntity<ServiceProvider> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(service.updateProviderProfile(authentication.getName(), request));
    }

    /** Deactivate provider's own account (sets isActive = false). */
    @PatchMapping("/deactivate")
    public ResponseEntity<String> deactivateSelf(Authentication authentication) {
        service.deactivateSelf(authentication.getName());
        return ResponseEntity.ok("Provider account deactivated successfully");
    }

    /** Soft-delete provider's own account (sets isDeleted = true, isActive = false). */
    @PatchMapping("/delete")
    public ResponseEntity<String> softDeleteSelf(Authentication authentication) {
        service.softDeleteSelf(authentication.getName());
        return ResponseEntity.ok("Provider account deleted successfully");
    }

    // ── Feature 5: Avatar Upload ──────────────────────────────────────────────

    /** Upload a profile picture for the provider. Returns updated provider object. */
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            ServiceProvider updated = service.uploadAvatar(authentication.getName(), file);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save avatar."));
        }
    }
}