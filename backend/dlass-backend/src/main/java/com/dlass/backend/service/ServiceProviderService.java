package com.dlass.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dlass.backend.dto.PageResponse;
import com.dlass.backend.dto.ProfileUpdateRequest;
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
import com.dlass.backend.service.NotificationService;
import com.dlass.backend.model.NotificationType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ServiceProviderService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final ServiceProviderRepository repository;
    private final UserRepository userRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProviderAvailabilityRepository availabilityRepository;
    private final NotificationService notificationService;

    @Value("${app.avatar.dir:uploads/avatars}")
    private String avatarDir;

    public ServiceProviderService(ServiceProviderRepository repository,
                                  UserRepository userRepository,
                                  ServiceOfferingRepository serviceOfferingRepository,
                                  ReviewRepository reviewRepository,
                                  AppointmentRepository appointmentRepository,
                                  ProviderAvailabilityRepository availabilityRepository,
                                  NotificationService notificationService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.availabilityRepository = availabilityRepository;
        this.notificationService = notificationService;
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

        Optional<ServiceProvider> existingOpt = repository.findByUserId(user.getId());
        if (existingOpt.isPresent()) {
            ServiceProvider existing = existingOpt.get();
            if ("SUSPENDED".equals(existing.getStatus()) || "REJECTED".equals(existing.getStatus())) {
                existing.setStatus("PENDING");
                existing.setBusinessName(request.getBusinessName());
                existing.setDescription(request.getDescription());
                existing.setCategoryId(request.getCategoryId());
                existing.setSubCategoryId(request.getSubCategoryId());
                existing.setServices(request.getServices());
                existing.setExperienceYears(request.getExperienceYears());
                existing.setCity(request.getCity());
                existing.setArea(request.getArea());
                existing.setPincode(request.getPincode());
                existing.setReapplyReason(request.getReapplyReason());
                if (request.getPhone() != null) existing.setPhone(request.getPhone());
                existing.setUpdatedAt(LocalDateTime.now());
                return repository.save(existing);
            } else {
                throw new RuntimeException("Provider profile already exists or pending");
            }
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
        provider.setReapplyReason(request.getReapplyReason());
        if (request.getPhone() != null) provider.setPhone(request.getPhone());
        provider.setStatus("PENDING");
        provider.setCreatedAt(LocalDateTime.now());
        provider.setUpdatedAt(LocalDateTime.now());
        provider.setRating(0);
        provider.setReviewCount(0);

        ServiceProvider saved = repository.save(provider);

        // Notify all ADMIN users about the new provider application
        try {
            List<User> admins = userRepository.findByRoleAndIsActiveTrue("ADMIN");
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        "New provider application: " + request.getBusinessName() + " is awaiting approval.",
                        NotificationType.ADMIN,
                        saved.getId(),
                        "/admin"
                );
            }
        } catch (Exception e) {
            System.out.println("Could not notify admins: " + e.getMessage());
        }

        return saved;
    }

    public List<ServiceProvider> getPendingProviders() {
        List<ServiceProvider> providers = repository.findByStatusAndIsActiveTrue("PENDING");
        for (ServiceProvider p : providers) {
            userRepository.findById(p.getUserId()).ifPresent(user -> {
                p.setUserName(user.getFullName());
                p.setUserEmail(user.getEmail());
            });
        }
        return providers;
    }

    /** Returns only active (isActive=true) providers for admin list. */
    public List<ServiceProvider> getAllProviders() {
        return repository.findByIsActiveTrue();
    }

    public List<ServiceProvider> getBySubCategory(String subCategoryId) {
        return repository.findBySubCategoryIdAndStatusAndIsActiveTrue(subCategoryId, "ACTIVE");
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

    /**
     * Search providers by category/subcategory with optional city + proximity-based pincode filter.
     *
     * <p>Pincode matching uses numeric proximity:
     * {@code abs(provider.pincode - userPincode) <= range}
     *
     * <p>If no results are found within {@code range}, the search automatically retries with
     * {@code range * 2} (Phase 4 fallback). Results are sorted nearest-first, with rating and
     * review count as tie-breakers.
     *
     * @param range default 50, configurable via request param (Phase 2)
     */
    public List<ServiceProvider> searchProviders(
            String categoryId, String subCategoryId,
            String userPincode, String city,
            int range) {

        // Fetch all active providers in the requested category/sub-category
        List<ServiceProvider> candidates = repository
                .findByCategoryIdAndSubCategoryIdAndStatusAndIsActiveTrue(categoryId, subCategoryId, "ACTIVE");

        // Parse user pincode once (null / blank → no pincode filter at all)
        Integer userPin = parsePincode(userPincode);

        // Apply city + proximity filter
        List<ServiceProvider> results = applyFilters(candidates, userPin, city, range);

        // Phase 4 fallback: widen to range×2 when nothing found
        if (results.isEmpty() && userPin != null) {
            results = applyFilters(candidates, userPin, city, range * 2);
        }

        // Sort: nearest pincode first; ties broken by composite score (rating + reviews)
        Integer finalUserPin = userPin;
        results = new java.util.ArrayList<>(results);
        results.sort((a, b) -> {
            int distA = pincodeDistance(a.getPincode(), finalUserPin);
            int distB = pincodeDistance(b.getPincode(), finalUserPin);
            if (distA != distB) return Integer.compare(distA, distB);          // nearest first
            return Integer.compare(calculateScore(b, userPincode),              // higher score first
                                   calculateScore(a, userPincode));
        });

        return results;
    }

    /**
     * Paginated + sortable version of searchProviders.
     * Applies the same filter/distance logic, then sorts and paginates in-memory.
     *
     * @param sortField  "rating" or "experience" (default: proximity).
     * @param sortDir    "asc" or "desc".
     * @param page       0-based page index.
     * @param size       page size.
     */
    public PageResponse<ProviderSearchResponse> searchProvidersPageable(
            String categoryId, String subCategoryId,
            String userPincode, String city, int range,
            String sortField, String sortDir,
            Integer minExperience, Double minRating,
            Double minPrice, Double maxPrice, Boolean availableToday,
            int page, int size) {

        // Re-use existing search + sort logic
        List<ServiceProvider> sorted = searchProviders(categoryId, subCategoryId, userPincode, city, range);

        // Filters
        if (minExperience != null && minExperience > 0) {
            sorted = sorted.stream().filter(p -> p.getExperienceYears() >= minExperience).toList();
        }
        if (minRating != null && minRating > 0) {
            sorted = sorted.stream().filter(p -> p.getRating() >= minRating).toList();
        }
        if (availableToday != null && availableToday) {
            java.time.DayOfWeek today = LocalDate.now().getDayOfWeek();
            sorted = sorted.stream().filter(p -> {
                return !availabilityRepository.findByProviderIdAndDayOfWeek(p.getId(), today).isEmpty();
            }).toList();
        }
        if (minPrice != null || maxPrice != null) {
            sorted = sorted.stream().filter(p -> {
                List<ServiceOffering> offerings = serviceOfferingRepository.findByProviderId(p.getId());
                return offerings.stream().filter(ServiceOffering::isActive).anyMatch(offering -> {
                    boolean ok = true;
                    if (minPrice != null && offering.getPrice() < minPrice) ok = false;
                    if (maxPrice != null && offering.getPrice() > maxPrice) ok = false;
                    return ok;
                });
            }).toList();
        }

        // Additional sort override if caller specified one
        if (sortField != null && !sortField.isBlank()) {
            Comparator<ServiceProvider> comp;
            switch (sortField.toLowerCase()) {
                case "rating" -> comp = Comparator.comparingDouble(ServiceProvider::getRating);
                case "experience" -> comp = Comparator.comparingInt(ServiceProvider::getExperienceYears);
                default -> comp = Comparator.comparingDouble(ServiceProvider::getRating);
            }
            if ("asc".equalsIgnoreCase(sortDir)) {
                sorted = new ArrayList<>(sorted);
                sorted.sort(comp);
            } else {
                sorted = new ArrayList<>(sorted);
                sorted.sort(comp.reversed());
            }
        }

        long total = sorted.size();
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 1;
        int from = Math.min(page * size, sorted.size());
        int to = Math.min(from + size, sorted.size());
        List<ServiceProvider> pageContent = sorted.subList(from, to);

        List<ProviderSearchResponse> responseList = pageContent.stream()
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

        return new PageResponse<>(responseList, page, totalPages, total, size);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /** Returns null when pincode is absent/blank/non-numeric. */
    private Integer parsePincode(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try { return Integer.parseInt(raw.trim()); }
        catch (NumberFormatException e) { return null; }
    }

    /**
     * Absolute numeric distance between a provider's pincode and the user pin.
     * Returns {@link Integer#MAX_VALUE} when the provider has no parseable pincode.
     */
    private int pincodeDistance(String providerPincode, Integer userPin) {
        if (userPin == null || providerPincode == null) return 0; // no filter → treat as "same"
        try { return Math.abs(Integer.parseInt(providerPincode.trim()) - userPin); }
        catch (NumberFormatException e) { return Integer.MAX_VALUE; }
    }

    /** Filter list by city (exact, case-insensitive) and pincode proximity. */
    private List<ServiceProvider> applyFilters(
            List<ServiceProvider> providers, Integer userPin, String city, int range) {

        return providers.stream()
                .filter(p -> {
                    // City filter (optional, exact match)
                    if (city != null && !city.isBlank()) {
                        if (p.getCity() == null) return false;
                        if (!p.getCity().trim().equalsIgnoreCase(city.trim())) return false;
                    }
                    // Pincode proximity filter (optional)
                    if (userPin != null) {
                        int dist = pincodeDistance(p.getPincode(), userPin);
                        if (dist > range) return false;
                    }
                    return true;
                })
                .toList();
    }


    public ProviderProfileResponse getProviderProfile(String providerId) {
        ServiceProvider provider = repository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Provider not found"));
        userRepository.findById(provider.getUserId()).ifPresent(user -> {
            provider.setUserName(user.getFullName());
            provider.setUserEmail(user.getEmail());
        });
        List<ServiceDTO> services = serviceOfferingRepository.findByProviderId(providerId)
                                        .stream().map(s -> new ServiceDTO(
                                            s.getId(),
                                            s.getName(),
                                            s.getDurationMinutes(),
                                            s.getPrice()
                                        )).toList();
                                        
        List<Review> reviews =
            reviewRepository.findByProviderId(providerId);
        reviews.forEach(review ->
            userRepository.findById(review.getUserId())
                .ifPresent(user -> review.setUserName(user.getFullName()))
        );
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
                .map(s -> new ServiceDTO(s.getId(), s.getName(), s.getDurationMinutes(), s.getPrice()))
                .toList();
    }

    public ServiceOffering addServiceOffering(String email, ServiceOffering offering) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = repository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        offering.setProviderId(provider.getId());
        offering.setCreatedAt(LocalDateTime.now());
        offering.setUpdatedAt(LocalDateTime.now());
        offering.setActive(true);

        return serviceOfferingRepository.save(offering);
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
        int durationMinutes = offering.getDurationMinutes();

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
        LocalDateTime now = LocalDateTime.now();
        boolean isToday = date.isEqual(now.toLocalDate());

        for (ProviderAvailability avail : availabilities) {
            LocalTime cursor = avail.getStartTime();
            LocalTime windowEnd = avail.getEndTime();

            while (!cursor.plusMinutes(durationMinutes).isAfter(windowEnd)) {
                LocalTime slotStart = cursor;
                LocalTime slotEnd = cursor.plusMinutes(durationMinutes);

                // Skip past slots if booking for today
                if (isToday && !slotStart.isAfter(now.toLocalTime())) {
                    cursor = slotEnd;
                    continue;
                }

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

    /** Returns {status: PENDING|ACTIVE|SUSPENDED|NONE} for the authenticated user. */
    public java.util.Map<String, String> getMyStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        java.util.Map<String, String> result = new java.util.HashMap<>();
        repository.findByUserId(user.getId()).ifPresentOrElse(
                p -> result.put("status", p.getStatus()),
                () -> result.put("status", "NONE")
        );
        return result;
    }

    /** Soft-delete: marks provider inactive instead of removing from DB. */
    public void deleteProvider(String id) {
        ServiceProvider provider = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setActive(false);
        repository.save(provider);
    }

    public List<ServiceProvider> getDeletedProviders() {
        return repository.findDeletedProviders();
    }

    public void reactivateProvider(String id) {
        ServiceProvider provider = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setActive(true);
        provider.setDeleted(false);
        provider.setDeletedAt(null);
        provider.setDeletedBy(null);
        provider.setDeactivationReason(null);
        repository.save(provider);
    }

    // ── Feature 4: Profile Management ────────────────────────────────────────

    /** Update authenticated provider's own profile fields. */
    public ServiceProvider updateProviderProfile(String email, ProfileUpdateRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            provider.setPhone(req.getPhone());
            user.setPhone(req.getPhone()); // keep user phone in sync
            userRepository.save(user);
        }
        if (req.getBusinessName() != null && !req.getBusinessName().isBlank()) {
            provider.setBusinessName(req.getBusinessName());
        }
        if (req.getCity() != null && !req.getCity().isBlank()) {
            provider.setCity(req.getCity());
        }
        if (req.getArea() != null && !req.getArea().isBlank()) {
            provider.setArea(req.getArea());
        }
        if (req.getPincode() != null && !req.getPincode().isBlank()) {
            provider.setPincode(req.getPincode());
        }
        if (req.getDescription() != null) {
            provider.setDescription(req.getDescription().trim());
        }
        if (req.getProfileImageUrl() != null && !req.getProfileImageUrl().isBlank()) {
            provider.setProfileImageUrl(req.getProfileImageUrl());
        }
        provider.setUpdatedAt(LocalDateTime.now());
        return repository.save(provider);
    }

    /** Deactivate provider's own account — sets isActive = false. */
    public void deactivateSelf(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setActive(false);
        provider.setDeactivationReason("Self-deactivated");
        repository.save(provider);
    }

    /** Soft-delete provider's own account. */
    public void softDeleteSelf(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setActive(false);
        provider.setDeleted(true);
        provider.setDeletedAt(LocalDateTime.now());
        provider.setDeletedBy(email);
        repository.save(provider);
    }

    // ── Feature 5: Avatar Upload ──────────────────────────────────────────────

    /** Upload a profile avatar for the provider (stores URL in profileImageUrl). */
    public ServiceProvider uploadAvatar(String email, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 5 MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + ext;

        Path dir = Paths.get(avatarDir).toAbsolutePath();
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        provider.setProfileImageUrl("/uploads/avatars/" + filename);
        provider.setUpdatedAt(LocalDateTime.now());
        return repository.save(provider);
    }
}
