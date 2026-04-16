package com.dlass.backend.controller;

import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dlass.backend.service.ServiceProviderService;
import com.dlass.backend.service.UserService;
import com.dlass.backend.service.NotificationService;
import com.dlass.backend.model.NotificationType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.frontend-url}")
public class AdminController {

    private final ServiceProviderService serviceProviderService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    public AdminController(ServiceProviderService serviceProviderService,
                           UserService userService,
                           UserRepository userRepository,
                           ServiceProviderRepository providerRepository,
                           AppointmentRepository appointmentRepository,
                           NotificationService notificationService) {
        this.serviceProviderService = serviceProviderService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/test")
    public String adminAccess() {
        return "Admin access granted";
    }

    // ── Provider Approval ────────────────────────────────────────────────────

    @GetMapping("/providers/pending")
    public List<ServiceProvider> getPendingProviders() {
        return serviceProviderService.getPendingProviders();
    }

    @PostMapping("/providers/{id}/approve")
    public ServiceProvider approveProvider(@PathVariable String id) {
        ServiceProvider provider = serviceProviderService.approve(id);
        if (provider != null && provider.getUserId() != null) {
            notificationService.createNotification(
                    provider.getUserId(),
                    "Your provider account has been approved by the admin. You are now ACTIVE.",
                    NotificationType.ADMIN,
                    provider.getId(),
                    "/provider/dashboard"
            );
        }
        return provider;
    }

    @PostMapping("/providers/{id}/reject")
    public ServiceProvider rejectProvider(@PathVariable String id) {
        ServiceProvider provider = serviceProviderService.reject(id);
        if (provider != null && provider.getUserId() != null) {
            notificationService.createNotification(
                    provider.getUserId(),
                    "Your provider account application was rejected by the admin.",
                    NotificationType.ADMIN,
                    provider.getId(),
                    "/dashboard"
            );
        }
        return provider;
    }

    // ── Aggregate Stats ───────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<ServiceProvider> allProviders = serviceProviderService.getAllProviders();
        long totalUsers = userRepository.findByIsActiveTrue().stream()
                .filter(u -> "USER".equals(u.getRole())).count();
        long totalProviders = allProviders.size();
        long activeProviders = allProviders.stream().filter(p -> "ACTIVE".equals(p.getStatus())).count();
        long inactiveProviders = totalProviders - activeProviders;
        long totalAppointments = appointmentRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalProviders", totalProviders);
        stats.put("activeProviders", activeProviders);
        stats.put("inactiveProviders", inactiveProviders);
        stats.put("totalAppointments", totalAppointments);
        return ResponseEntity.ok(stats);
    }

    // ── Phase 3: Weekly Stats ─────────────────────────────────────────────────

    @GetMapping("/weekly-stats")
    public ResponseEntity<Map<String, Object>> getWeeklyStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDate dateFrom = weekAgo.toLocalDate();
        LocalDate dateTo = LocalDate.now();

        long appointmentsLastWeek = appointmentRepository.countByDateBetween(dateFrom, dateTo);
        long newUsers = userRepository.countByCreatedAtBetweenAndIsActiveTrue(weekAgo, now);
        long newProviders = providerRepository.countByCreatedAtBetweenAndIsActiveTrue(weekAgo, now);

        Map<String, Object> result = new HashMap<>();
        result.put("appointmentsLastWeek", appointmentsLastWeek);
        result.put("newUsers", newUsers);
        result.put("newProviders", newProviders);
        return ResponseEntity.ok(result);
    }

    // ── Phase 4.1: Appointments Last Week ────────────────────────────────────

    @GetMapping("/appointments-last-week")
    public ResponseEntity<List<Map<String, String>>> getAppointmentsLastWeek() {
        LocalDate dateFrom = LocalDate.now().minusDays(7);
        LocalDate dateTo = LocalDate.now();

        List<Appointment> appointments = appointmentRepository.findByDateBetween(dateFrom, dateTo);

        List<Map<String, String>> result = new ArrayList<>();
        for (Appointment a : appointments) {
            User user = userRepository.findById(a.getUserId()).orElse(null);
            ServiceProvider provider = providerRepository.findById(a.getProviderId()).orElse(null);

            // Skip if provider or user is soft-deleted
            if (user != null && !user.isActive()) continue;
            if (provider != null && !provider.isActive()) continue;

            Map<String, String> row = new HashMap<>();
            row.put("userName", user != null ? user.getFullName() : "Unknown");
            row.put("providerName", provider != null ? provider.getBusinessName() : "Unknown");
            row.put("serviceName", a.getServiceName() != null ? a.getServiceName() : "—");
            row.put("date", a.getDate() != null ? a.getDate().toString() : "—");
            row.put("time", a.getStartTime() != null ? a.getStartTime().toString() : "—");
            row.put("status", a.getStatus() != null ? a.getStatus() : "—");
            result.add(row);
        }
        return ResponseEntity.ok(result);
    }

    // ── Phase 4.2: New Users (last 7 days) ───────────────────────────────────

    @GetMapping("/new-users")
    public ResponseEntity<List<Map<String, String>>> getNewUsers() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();

        List<User> users = userRepository.findByCreatedAtBetweenAndIsActiveTrue(weekAgo, now);

        List<Map<String, String>> result = users.stream()
                .filter(u -> "USER".equals(u.getRole()))
                .map(u -> {
                    Map<String, String> row = new HashMap<>();
                    row.put("name", u.getFullName());
                    row.put("email", u.getEmail());
                    row.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "—");
                    return row;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    // ── Phase 4.3: New Providers (last 7 days) ───────────────────────────────

    @GetMapping("/new-providers")
    public ResponseEntity<List<Map<String, String>>> getNewProviders() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();

        List<ServiceProvider> providers = providerRepository.findByCreatedAtBetweenAndIsActiveTrue(weekAgo, now);

        List<Map<String, String>> result = providers.stream().map(p -> {
            Map<String, String> row = new HashMap<>();
            row.put("businessName", p.getBusinessName());
            row.put("city", p.getCity() != null ? p.getCity() : "—");
            row.put("status", p.getStatus() != null ? p.getStatus() : "—");
            row.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "—");
            return row;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // ── Phase 1: Admin User List (role=USER, isActive=true only) ─────────────

    @GetMapping("/users")
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAdminUserList();
    }

    @GetMapping("/users/deleted")
    public List<UserResponseDTO> getDeletedUsers() {
        return userService.getDeletedUsers();
    }

    @PutMapping("/users/{id}/reactivate")
    public ResponseEntity<String> reactivateUser(@PathVariable String id) {
        userService.reactivateUser(id);
        
        notificationService.createNotification(
                id,
                "Your account has been reactivated by the admin.",
                NotificationType.ADMIN,
                id,
                "/dashboard"
        );
        
        return ResponseEntity.ok("User reactivated successfully");
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        
        notificationService.createNotification(
                id,
                "Your account has been deactivated by the admin.",
                NotificationType.ADMIN,
                id,
                "/dashboard"
        );
        
        return ResponseEntity.ok("User deactivated");
    }

    // ── All Providers (active only) ─────────────────────────────────────────

    @GetMapping("/all-providers")
    public List<ServiceProvider> getAllProviders() {
        return serviceProviderService.getAllProviders();
    }

    @GetMapping("/providers/deleted")
    public List<ServiceProvider> getDeletedProviders() {
        return serviceProviderService.getDeletedProviders();
    }

    @PutMapping("/providers/{id}/reactivate")
    public ResponseEntity<String> reactivateProvider(@PathVariable String id) {
        serviceProviderService.reactivateProvider(id);
        
        providerRepository.findById(id).ifPresent(provider -> {
            notificationService.createNotification(
                    provider.getUserId(),
                    "Your provider account has been reactivated by the admin.",
                    NotificationType.ADMIN,
                    provider.getId(),
                    "/provider/dashboard"
            );
        });
        
        return ResponseEntity.ok("Provider reactivated successfully");
    }

    @DeleteMapping("/provider/{id}")
    public ResponseEntity<String> deleteProvider(@PathVariable String id) {
        serviceProviderService.deleteProvider(id);
        
        providerRepository.findById(id).ifPresent(provider -> {
            notificationService.createNotification(
                    provider.getUserId(),
                    "Your provider account has been deactivated by the admin.",
                    NotificationType.ADMIN,
                    provider.getId(),
                    "/dashboard"
            );
        });
        
        return ResponseEntity.ok("Provider deactivated");
    }
}