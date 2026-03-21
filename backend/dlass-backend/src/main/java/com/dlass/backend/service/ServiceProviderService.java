package com.dlass.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.dlass.backend.dto.ProviderProfileResponse;
import com.dlass.backend.dto.ProviderSearchResponse;
import com.dlass.backend.dto.ServiceDTO;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ProviderAvailability;
import com.dlass.backend.model.Review;
import com.dlass.backend.model.ServiceOffering;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ProviderAvailabilityRepository;
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
    private final AppointmentRepository appointmentRepository;
    private final ProviderAvailabilityRepository availabilityRepository;

    public ServiceProviderService(ServiceProviderRepository repository,
                                  UserRepository userRepository,
                                  ServiceOfferingRepository serviceOfferingRepository,
                                  ReviewRepository reviewRepository,
                                  AppointmentRepository appointmentRepository,
                                  ProviderAvailabilityRepository availabilityRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
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

    public ServiceProvider applyAsProvider(ProviderApplicationRequest request, String email) {
        User user = userRepository.findByEmail(email)
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

    public List<ServiceProvider> searchProviders(String categoryId, String subCategoryId, String userPincode, String city) {

        List<ServiceProvider> providers = repository.findByCategoryIdAndSubCategoryIdAndStatus(categoryId, subCategoryId, "ACTIVE");

        return providers.stream()
                .filter(p -> {
                    // City filter: if city provided, match case-insensitively
                    if (city != null && !city.isBlank()) {
                        if (p.getCity() == null) return false;
                        if (!p.getCity().trim().equalsIgnoreCase(city.trim())) return false;
                    }
                    // Pincode prefix filter: if pincode provided, provider pincode must start with it
                    if (userPincode != null && !userPincode.isBlank()) {
                        if (p.getPincode() == null) return false;
                        if (!p.getPincode().startsWith(userPincode.trim())) return false;
                    }
                    return true;
                })
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
        int distanceScore = 0;
        if (userPincode != null && !userPincode.isBlank() && provider.getPincode() != null) {
            try {
                int providerPin = Integer.parseInt(provider.getPincode());
                int userPin = Integer.parseInt(userPincode);
                int distanceDiff = Math.abs(providerPin - userPin);
                distanceScore = Math.max(0, 100 - distanceDiff);
            } catch (NumberFormatException ignored) {}
        }
        int ratingScore = (int) (provider.getRating() * 20);
        int reviewScore = provider.getReviewCount() * 2;
        return distanceScore + ratingScore + reviewScore;
    }

    /** Return all active service offerings for a provider. */
    public List<ServiceDTO> getServiceOfferings(String providerId) {
        return serviceOfferingRepository.findByProviderId(providerId)
                .stream()
                .filter(ServiceOffering::isActive)
                .map(s -> new ServiceDTO(s.getId(), s.getName(), s.getDuration(), s.getPrice()))
                .toList();
    }

    /**
     * Generate available time slots for a provider on a given date for a specific service.
     * Uses the service's own duration (not a fixed slot size from availability).
     * Removes slots that overlap any existing non-CANCELLED appointment.
     */
    public List<Map<String, String>> getAvailableSlots(String providerId, String serviceId, LocalDate date) {

        // 1. Validate provider
        repository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // 2. Fetch service duration
        ServiceOffering offering = serviceOfferingRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        int durationMinutes = offering.getDuration();

        // 3. Fetch provider availabilities for that day-of-week
        List<ProviderAvailability> availabilities = availabilityRepository
                .findByProviderIdAndDayOfWeek(providerId, date.getDayOfWeek());

        // 4. No availability set → return empty (don't crash)
        if (availabilities.isEmpty()) {
            return List.of();
        }

        // 5. Fetch existing non-cancelled appointments for provider on that date
        List<Appointment> existing = appointmentRepository.findByProviderIdAndDate(providerId, date)
                .stream()
                .filter(a -> !"CANCELLED".equals(a.getStatus()))
                .toList();

        // 6. Generate slots across all availability windows for that day
        List<Map<String, String>> slots = new ArrayList<>();
        for (ProviderAvailability avail : availabilities) {
            LocalTime cursor = avail.getStartTime();
            LocalTime windowEnd = avail.getEndTime();

            while (!cursor.plusMinutes(durationMinutes).isAfter(windowEnd)) {
                LocalTime slotStart = cursor;
                LocalTime slotEnd = cursor.plusMinutes(durationMinutes);

                // 7. Strict overlap check: existing.start < slotEnd AND existing.end > slotStart
                boolean hasConflict = existing.stream().anyMatch(a ->
                        a.getStartTime().isBefore(slotEnd) && a.getEndTime().isAfter(slotStart)
                );

                if (!hasConflict) {
                    Map<String, String> slot = new HashMap<>();
                    slot.put("startTime", slotStart.toString());
                    slot.put("endTime", slotEnd.toString());
                    slots.add(slot);
                }

                cursor = slotEnd;
            }
        }

        return slots;
    }

}