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

        dto.setAverageRating(provider.getRating());
        dto.setReviewCount(provider.getReviewCount());
        dto.setCategoryId(provider.getCategoryId());
        dto.setSubCategoryId(provider.getSubCategoryId());

        return dto;
    }

    // ── Feature 1a: bookings last 7 days ──────────────────────────────────

    public List<BookingsWeekDTO> getBookingsPerWeek(String email) {
        String providerId = resolveProviderId(email);
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(6);   // last 7 days inclusive

        List<Appointment> appts = appointmentRepository
                .findByProviderIdAndDateBetween(providerId, from, today);

        // Pre-fill all 7 days with 0
        Map<String, Long> dayMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            dayMap.put(today.minusDays(i).format(fmt), 0L);
        }

        // Count per day
        for (Appointment a : appts) {
            String key = a.getDate().format(fmt);
            dayMap.merge(key, 1L, Long::sum);
        }

        List<BookingsWeekDTO> result = new ArrayList<>();
        dayMap.forEach((date, count) -> result.add(new BookingsWeekDTO(date, count)));
        return result;
    }

    // ── Feature 1b: revenue last 12 months ────────────────────────────────

    public List<RevenueMonthDTO> getRevenuePerMonth(String email) {
        String providerId = resolveProviderId(email);
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusMonths(11).withDayOfMonth(1);

        List<Appointment> completed = appointmentRepository
                .findByProviderIdAndStatusAndDateBetween(providerId, "COMPLETED", from, today);

        // Pre-fill 12 months with 0
        Map<String, Double> monthMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 11; i >= 0; i--) {
            monthMap.put(today.minusMonths(i).format(fmt), 0.0);
        }

        for (Appointment a : completed) {
            String key = a.getDate().format(fmt);
            monthMap.merge(key, a.getAmount(), Double::sum);
        }

        List<RevenueMonthDTO> result = new ArrayList<>();
        monthMap.forEach((month, rev) -> result.add(new RevenueMonthDTO(month, rev)));
        return result;
    }

    // ── Feature 1c: peak hours ────────────────────────────────────────────

    public List<PeakHourDTO> getPeakHours(String email) {
        String providerId = resolveProviderId(email);

        List<Appointment> appts = appointmentRepository.findByProviderId(providerId);

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