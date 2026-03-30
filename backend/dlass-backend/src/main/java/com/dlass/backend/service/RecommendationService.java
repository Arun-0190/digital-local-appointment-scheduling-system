package com.dlass.backend.service;

import com.dlass.backend.model.Appointment;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ProviderAvailabilityRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Rule-based AI recommendation engine — no external API calls.
 */
@Service
public class RecommendationService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ProviderAvailabilityRepository availabilityRepository;

    public RecommendationService(AppointmentRepository appointmentRepository,
                                 ServiceProviderRepository providerRepository,
                                 UserRepository userRepository,
                                 ProviderAvailabilityRepository availabilityRepository) {
        this.appointmentRepository = appointmentRepository;
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
    }

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

    public List<String> getRecommendations(String email, String range) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        String providerId = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"))
                .getId();

        List<Appointment> allAppts = appointmentRepository.findByProviderId(providerId);
        
        LocalDate today = LocalDate.now();
        LocalDate from = calculateStartDate(range);
        
        List<Appointment> shortTermAppts = allAppts.stream()
                .filter(a -> a.getDate() != null && !a.getDate().isBefore(from) && !a.getDate().isAfter(today))
                .collect(Collectors.toList());

        List<String> suggestions = new ArrayList<>();

        // ── Rule 1: Peak Hour Detection (Short-term) ───────────────────────────────────
        Map<Integer, Long> hourCounts = shortTermAppts.stream()
                .filter(a -> a.getStartTime() != null)
                .collect(Collectors.groupingBy(a -> a.getStartTime().getHour(), Collectors.counting()));

        if (!hourCounts.isEmpty()) {
            // Find top hour
            int peakHour = hourCounts.entrySet().stream()
                    .max(Comparator.comparingLong(Map.Entry::getValue))
                    .map(Map.Entry::getKey)
                    .orElse(-1);

            long peakCount = hourCounts.getOrDefault(peakHour, 0L);
            if (peakHour >= 0 && peakCount >= 2) {
                // Group morning (6-12), afternoon (12-17), evening (17-21)
                String period;
                if (peakHour >= 6 && peakHour < 12) period = "morning";
                else if (peakHour >= 12 && peakHour < 17) period = "afternoon";
                else if (peakHour >= 17 && peakHour < 21) period = "evening";
                else period = String.format("%d:00", peakHour);

                suggestions.add(String.format(
                    "📈 Peak bookings detected around %d:00 (%s). Consider adding more availability slots during this time.",
                    peakHour, period));
            }
        }

        // ── Rule 2: Weekend Demand Detection (Long-term) ─────────────────────────────
        long weekendBookings = allAppts.stream()
                .filter(a -> a.getDate() != null)
                .filter(a -> {
                    java.time.DayOfWeek d = a.getDate().getDayOfWeek();
                    return d == java.time.DayOfWeek.SATURDAY || d == java.time.DayOfWeek.SUNDAY;
                }).count();

        long weekdayBookings = allAppts.size() - weekendBookings;
        if (weekendBookings > 0 && weekdayBookings > 0) {
            double weekendRatio = (double) weekendBookings / allAppts.size();
            if (weekendRatio > 0.35) {
                suggestions.add("📅 You receive " + Math.round(weekendRatio * 100) +
                    "% of your bookings on weekends. Consider increasing availability on Saturdays and Sundays.");
            }
        }

        // ── Rule 3: Popular Service Detection ────────────────────────────
        Optional<Map.Entry<String, Long>> topService = allAppts.stream()
                .filter(a -> a.getServiceName() != null && !a.getServiceName().isBlank())
                .collect(Collectors.groupingBy(Appointment::getServiceName, Collectors.counting()))
                .entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue));

        topService.ifPresent(entry -> {
            suggestions.add("⭐ Most popular service: \"" + entry.getKey() + "\" (" +
                entry.getValue() + " bookings). Consider highlighting it in your profile description.");
        });

        // ── Rule 4: Slot Shortage Detection (Short-term) ──────────────────────────────
        long recentBookings = shortTermAppts.size();

        long availabilitySlots = availabilityRepository.findByProviderId(providerId).size();

        if (availabilitySlots > 0 && recentBookings >= availabilitySlots) {
            suggestions.add("🔔 High demand detected for the selected range: You had " + recentBookings +
                " bookings with only " + availabilitySlots +
                " availability window(s). Consider adding more working hours.");
        }

        // ── Rule 5: Cancellation Rate Warning (Long-term) ────────────────────────────
        long cancelled = allAppts.stream()
                .filter(a -> "CANCELLED".equals(a.getStatus())).count();
        if (allAppts.size() >= 5 && cancelled > 0) {
            double cancelRate = (double) cancelled / allAppts.size();
            if (cancelRate > 0.25) {
                suggestions.add("⚠️ Cancellation rate is " + Math.round(cancelRate * 100) +
                    "%. Consider reviewing your cancellation policy or sending reminders to clients.");
            }
        }

        // ── Default message when no data ─────────────────────────────────
        if (suggestions.isEmpty()) {
            suggestions.add("✅ No specific recommendations right now. Keep up the great work!");
            suggestions.add("💡 Tip: Complete more appointments to unlock personalized insights.");
        }

        return suggestions;
    }
}
