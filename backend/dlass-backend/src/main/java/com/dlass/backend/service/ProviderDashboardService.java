package com.dlass.backend.service;

import com.dlass.backend.dto.BookingsWeekDTO;
import com.dlass.backend.dto.PeakHourDTO;
import com.dlass.backend.dto.ProviderDashboardDTO;
import com.dlass.backend.dto.RevenueMonthDTO;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ReviewRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProviderDashboardService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public ProviderDashboardService(
            AppointmentRepository appointmentRepository,
            ServiceProviderRepository providerRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository) {

        this.appointmentRepository = appointmentRepository;
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    // ── existing dashboard summary ─────────────────────────────────────────

    public ProviderDashboardDTO getDashboard(String email) {
        System.out.println("[DLASS] Dashboard API hit for: " + email);

        try {
            User user = (User) userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ServiceProvider provider = providerRepository
                    .findByUserId(((Appointment) user).getId())
                    .orElseThrow(() -> new RuntimeException("Provider profile not found"));

            // ── Standardized Access Rule ──────────────────────────────────────────
            boolean isNotDeleted = !Boolean.TRUE.equals(provider.isDeleted());
            boolean isActive = Boolean.TRUE.equals(provider.isActive());
            boolean isStatusActive = "ACTIVE".equalsIgnoreCase(provider.getStatus());

            if (!isNotDeleted || (!isActive && !isStatusActive)) {
                System.err.println("[DLASS] Dashboard access denied: " + email);
                throw new RuntimeException("Make sure you are an approved provider.");
            }

            System.out.println("[DLASS] Provider found: " + provider.getId());

            String providerId = provider.getId();
            ProviderDashboardDTO dto = new ProviderDashboardDTO();
            dto.setProviderId(providerId);

            dto.setTotalAppointments(appointmentRepository.countByProviderId(providerId));
            dto.setTodayAppointments(appointmentRepository.countByProviderIdAndDate(providerId, LocalDate.now()));
            dto.setUpcomingAppointments(
                    appointmentRepository.countByProviderIdAndDateAfter(providerId, LocalDate.now()));

            List<Appointment> appointments = appointmentRepository.findByProviderId(providerId);
            if (appointments == null)
                appointments = new ArrayList<>();

            double revenue = appointments.stream()
                    .filter(a -> a != null && "COMPLETED".equalsIgnoreCase(a.getStatus()))
                    .mapToDouble(Appointment::getAmount)
                    .sum();

            dto.setTotalRevenue(revenue);
            dto.setRating(provider.getRating());
            dto.setReviewCount(provider.getReviewCount());
            dto.setCategoryId(provider.getCategoryId() != null ? provider.getCategoryId() : "");
            dto.setSubCategoryId(provider.getSubCategoryId() != null ? provider.getSubCategoryId() : "");

            dto.setFullName(user.getFullName() != null ? user.getFullName() : "Provider");
            dto.setUsername(email);
            dto.setEmail(((ProviderDashboardDTO) user).getEmail());
            dto.setBusinessName(provider.getBusinessName() != null ? provider.getBusinessName() : "Business");
            dto.setPhone(
                    provider.getPhone() != null ? provider.getPhone() : (user.getName() != null ? user.getName() : ""));
            dto.setCity(provider.getCity() != null ? provider.getCity() : "");
            dto.setArea(provider.getArea() != null ? provider.getArea() : "");
            dto.setPincode(provider.getPincode() != null ? provider.getPincode() : "");
            dto.setStatus(provider.getStatus() != null ? provider.getStatus() : "PENDING");
            dto.setCreatedAt(provider.getCreatedAt() != null ? provider.getCreatedAt()
                    : ((ProviderDashboardDTO) user).getCreatedAt());

            String imageUrl = (provider.getProfileImageUrl() != null && !provider.getProfileImageUrl().isEmpty())
                    ? provider.getProfileImageUrl()
                    : ((ProviderDashboardDTO) user).getProfileImageUrl();
            dto.setProfileImageUrl(imageUrl != null ? imageUrl : "");

            System.out.println("[DLASS] Response sent successfully for: " + email);
            return dto;
        } catch (Exception e) {
            System.err.println("[DLASS] Dashboard API Error for " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // ── helpers for date ranges ───────────────────────────────────────────
    private LocalDate calculateStartDate(String range) {
        if (range == null)
            return LocalDate.now().minusDays(6);
        return switch (range.toLowerCase()) {
            case "1d" -> LocalDate.now();
            case "3d" -> LocalDate.now().minusDays(2);
            case "7d" -> LocalDate.now().minusDays(6);
            case "15d" -> LocalDate.now().minusDays(14);
            case "1m" -> LocalDate.now().minusMonths(1);
            case "3m" -> LocalDate.now().minusMonths(3);
            case "6m" -> LocalDate.now().minusMonths(6);
            case "1y" -> LocalDate.now().minusYears(1);
            default -> LocalDate.now().minusDays(6);
        };
    }

    // ── Feature 1a: bookings by range ──────────────────────────────────

    public List<BookingsWeekDTO> getBookingsPerWeek(String email, String range) {
        System.out.println("[DLASS] Bookings API hit for: " + email + ", range: " + range);
        try {
            String providerId = resolveProviderId(email);
            LocalDate today = LocalDate.now();
            LocalDate from = calculateStartDate(range);

            List<Appointment> appts = appointmentRepository
                    .findByProviderIdAndDateBetween(providerId, from, today);

            // Pre-fill days based on range
            Map<String, Long> dayMap = new LinkedHashMap<>();
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
                dayMap.put(d.format(fmt), 0L);
            }

            // Count per day
            for (Appointment a : appts) {
                if (a == null || a.getDate() == null)
                    continue;
                String key = a.getDate().format(fmt);
                dayMap.merge(key, 1L, (v1, v2) -> v1 + v2);
            }

            List<BookingsWeekDTO> result = new ArrayList<>();
            dayMap.forEach((date, count) -> result.add(new BookingsWeekDTO(date, count)));
            System.out.println("[DLASS] Bookings API Success for: " + email);
            return result;
        } catch (Exception e) {
            System.err.println("[DLASS] Bookings API Error for " + email + ": " + e.getMessage());
            return new ArrayList<>(); // Return empty list on failure instead of 500
        }
    }

    // ── Feature 1b: revenue by range ────────────────────────────────

    public List<RevenueMonthDTO> getRevenuePerMonth(String email, String range) {
        System.out.println("[DLASS] Revenue API hit for: " + email + ", range: " + range);
        try {
            String providerId = resolveProviderId(email);
            LocalDate today = LocalDate.now();
            LocalDate from = calculateStartDate(range);

            List<Appointment> completed = appointmentRepository
                    .findByProviderIdAndStatusAndDateBetween(providerId, "COMPLETED", from, today);

            Map<String, Double> monthMap = new LinkedHashMap<>();
            DateTimeFormatter fmt;

            // Use daily formatting if range is small
            if (range != null && (range.endsWith("d") || range.equals("1m"))) {
                fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
                    monthMap.put(d.format(fmt), 0.0);
                }
            } else {
                fmt = DateTimeFormatter.ofPattern("yyyy-MM");
                LocalDate startMonth = from.withDayOfMonth(1);
                for (LocalDate d = startMonth; !d.isAfter(today); d = d.plusMonths(1)) {
                    monthMap.put(d.format(fmt), 0.0);
                }
            }

            for (Appointment a : completed) {
                if (a == null || a.getDate() == null)
                    continue;
                String key = a.getDate().format(fmt);
                monthMap.merge(key, a.getAmount(), (v1, v2) -> v1 + v2);
            }

            List<RevenueMonthDTO> result = new ArrayList<>();
            monthMap.forEach((month, rev) -> result.add(new RevenueMonthDTO(month, rev)));
            System.out.println("[DLASS] Revenue API Success for: " + email);
            return result;
        } catch (Exception e) {
            System.err.println("[DLASS] Revenue API Error for " + email + ": " + e.getMessage());
            return new ArrayList<>(); // Safe fallback
        }
    }

    // ── Feature 1c: peak hours ────────────────────────────────────────────

    public List<PeakHourDTO> getPeakHours(String email, String range) {
        System.out.println("[DLASS] Peak Hours API hit for: " + email + ", range: " + range);
        try {
            String providerId = resolveProviderId(email);
            LocalDate today = LocalDate.now();
            LocalDate from = calculateStartDate(range);

            List<Appointment> appts = appointmentRepository.findByProviderIdAndDateBetween(providerId, from, today);

            // Count per hour
            Map<Integer, Long> hourMap = appts.stream()
                    .filter(a -> a != null && a.getStartTime() != null)
                    .collect(Collectors.groupingBy(
                            a -> a.getStartTime().getHour(),
                            Collectors.counting()));

            List<PeakHourDTO> result = hourMap.entrySet().stream()
                    .map(e -> new PeakHourDTO(e.getKey(), e.getValue()))
                    .sorted(Comparator.comparingLong(PeakHourDTO::getCount).reversed())
                    .collect(Collectors.toList());

            System.out.println("[DLASS] Peak Hours API Success for: " + email);
            return result;
        } catch (Exception e) {
            System.err.println("[DLASS] Peak Hours API Error for " + email + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private String resolveProviderId(String email) {
        User user = (User) userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = providerRepository.findByUserId(((Appointment) user).getId())
                .orElseThrow(() -> new RuntimeException("Provider profile not found"));

        boolean isNotDeleted = !Boolean.TRUE.equals(provider.isDeleted());
        boolean isActive = Boolean.TRUE.equals(provider.isActive());
        boolean isStatusActive = "ACTIVE".equalsIgnoreCase(provider.getStatus());

        if (!isNotDeleted || (!isActive && !isStatusActive)) {
            throw new RuntimeException("Make sure you are an approved provider.");
        }

        return provider.getId();
    }
}