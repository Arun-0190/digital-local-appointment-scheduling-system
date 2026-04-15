package com.dlass.backend.service;

import com.dlass.backend.dto.BookingsWeekDTO;
import com.dlass.backend.dto.PeakHourDTO;
import com.dlass.backend.dto.ProviderDashboardDTO;
import com.dlass.backend.dto.RevenueMonthDTO;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ReviewRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
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

        String userId = userRepository.findByEmail(email)
                .orElseThrow()
                .getId();

        ServiceProvider provider = providerRepository
                .findByUserId(userId)
                .orElseThrow();

        String providerId = provider.getId();

        ProviderDashboardDTO dto = new ProviderDashboardDTO();
        dto.setProviderId(providerId);

        dto.setTotalAppointments(
                appointmentRepository.countByProviderId(providerId)
        );

        dto.setTodayAppointments(
                appointmentRepository.countByProviderIdAndDate(providerId, LocalDate.now())
        );

        dto.setUpcomingAppointments(
                appointmentRepository.countByProviderIdAndDateAfter(providerId, LocalDate.now())
        );

        List<Appointment> appointments =
                appointmentRepository.findByProviderId(providerId);

        double revenue = appointments.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .mapToDouble(Appointment::getAmount)
                .sum();

        dto.setTotalRevenue(revenue);

        dto.setRating(provider.getRating());
        dto.setReviewCount(provider.getReviewCount());
        dto.setCategoryId(provider.getCategoryId());
        dto.setSubCategoryId(provider.getSubCategoryId());
        dto.setBusinessName(provider.getBusinessName());
        dto.setPhone(provider.getPhone());
        dto.setCity(provider.getCity());
        dto.setArea(provider.getArea());
        dto.setPincode(provider.getPincode());
        dto.setDescription(provider.getDescription());
        dto.setProfileImageUrl(provider.getProfileImageUrl());
        dto.setJoinedDate(provider.getCreatedAt());

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            dto.setFullName(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setUsername(user.getEmail());
        }

        return dto;
    }

    // ── helpers for date ranges ───────────────────────────────────────────
    private LocalDate calculateStartDate(String range) {
        if (range == null) return LocalDate.now().minusDays(6);
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
        String providerId = resolveProviderId(email);
        LocalDate today = LocalDate.now();
        LocalDate from = calculateStartDate(range);

        List<Appointment> appts = appointmentRepository
                .findByProviderIdAndDateBetween(providerId, from, today);

        // Pre-fill days based on range
        Map<String, Long> dayMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        // Loop from start to today to preserve order
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            dayMap.put(d.format(fmt), 0L);
        }

        // Count per day
        for (Appointment a : appts) {
            String key = a.getDate().format(fmt);
            dayMap.merge(key, 1L, (v1, v2) -> v1 + v2);
        }

        List<BookingsWeekDTO> result = new ArrayList<>();
        dayMap.forEach((date, count) -> result.add(new BookingsWeekDTO(date, count)));
        return result;
    }

    // ── Feature 1b: revenue by range ────────────────────────────────

    public List<RevenueMonthDTO> getRevenuePerMonth(String email, String range) {
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
            String key = a.getDate().format(fmt);
            monthMap.merge(key, a.getAmount(), (v1, v2) -> v1 + v2);
        }

        List<RevenueMonthDTO> result = new ArrayList<>();
        monthMap.forEach((month, rev) -> result.add(new RevenueMonthDTO(month, rev)));
        return result;
    }

    // ── Feature 1c: peak hours ────────────────────────────────────────────

    public List<PeakHourDTO> getPeakHours(String email, String range) {
        String providerId = resolveProviderId(email);
        LocalDate today = LocalDate.now();
        LocalDate from = calculateStartDate(range);

        List<Appointment> appts = appointmentRepository.findByProviderIdAndDateBetween(providerId, from, today);

        // Count per hour
        Map<Integer, Long> hourMap = appts.stream()
                .filter(a -> a.getStartTime() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getStartTime().getHour(),
                        Collectors.counting()
                ));

        // Fill all 24 hours, even those with 0 bookings (omit 0-count for cleaner UX)
        List<PeakHourDTO> result = hourMap.entrySet().stream()
                .map(e -> new PeakHourDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(PeakHourDTO::getCount).reversed())
                .collect(Collectors.toList());

        return result;
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private String resolveProviderId(String email) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        return providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider profile not found"))
                .getId();
    }
}
