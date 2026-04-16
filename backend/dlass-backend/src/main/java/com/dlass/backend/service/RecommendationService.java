package com.dlass.backend.service;

import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.User;
import com.dlass.backend.model.ServiceProvider;
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
import java.time.format.DateTimeFormatter;

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
        System.out.println("[DLASS] Recommendations API hit for: " + email);
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            String userId = user.getId();
            
            ServiceProvider provider = providerRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));
            String providerId = provider.getId();

            List<Appointment> allAppts = appointmentRepository.findByProviderId(providerId);
            if (allAppts == null) allAppts = new ArrayList<>();
            
            LocalDate today = LocalDate.now();
            LocalDate from = calculateStartDate(range);
            
            List<Appointment> shortTermAppts = allAppts.stream()
                    .filter(a -> a != null && a.getDate() != null && !a.getDate().isBefore(from) && !a.getDate().isAfter(today))
                    .collect(Collectors.toList());

            List<String> suggestions = new ArrayList<>();

            // ── Peak Hour Detection ───────────────────────────────────────────
            Map<Integer, Long> hourCounts = shortTermAppts.stream()
                    .filter(a -> a != null && a.getStartTime() != null)
                    .collect(Collectors.groupingBy(a -> a.getStartTime().getHour(), Collectors.counting()));

            if (!hourCounts.isEmpty()) {
                int peakHour = hourCounts.entrySet().stream()
                        .max(Comparator.comparingLong(Map.Entry::getValue))
                        .map(Map.Entry::getKey)
                        .orElse(-1);

                long peakCount = hourCounts.getOrDefault(peakHour, 0L);
                if (peakHour >= 0 && peakCount >= 2) {
                    String period = (peakHour >= 6 && peakHour < 12) ? "morning" :
                                    (peakHour >= 12 && peakHour < 17) ? "afternoon" :
                                    (peakHour >= 17 && peakHour < 21) ? "evening" : String.format("%d:00", peakHour);
                    suggestions.add(String.format("📈 Peak bookings around %d:00 (%s). Consider adding slots here.", peakHour, period));
                }
            }

            // ── Weekend Demand ──────────────────────────────────────────
            long weekendBookings = allAppts.stream()
                    .filter(a -> a != null && a.getDate() != null)
                    .filter(a -> {
                        java.time.DayOfWeek d = a.getDate().getDayOfWeek();
                        return d == java.time.DayOfWeek.SATURDAY || d == java.time.DayOfWeek.SUNDAY;
                    }).count();

            if (!allAppts.isEmpty()) {
                double weekendRatio = (double) weekendBookings / allAppts.size();
                if (weekendRatio > 0.35) {
                    suggestions.add("📅 High weekend demand (" + Math.round(weekendRatio * 100) + "%). Consider more availability.");
                }
            }

            // ── Popular Service ────────────────────────────────────────────
            allAppts.stream()
                    .filter(a -> a != null && a.getServiceName() != null && !a.getServiceName().isBlank())
                    .collect(Collectors.groupingBy(Appointment::getServiceName, Collectors.counting()))
                    .entrySet().stream()
                    .max(Comparator.comparingLong(Map.Entry::getValue))
                    .ifPresent(entry -> suggestions.add("⭐ Top service: \"" + entry.getKey() + "\". Focus on this."));

            if (suggestions.isEmpty()) {
                suggestions.add("✅ Complete more appointments to unlock AI insights!");
            }
            
            System.out.println("[DLASS] Recommendations API Success for: " + email);
            return suggestions;
        } catch (Exception e) {
            System.err.println("[DLASS] Recommendations API Error for " + email + ": " + e.getMessage());
            return List.of("💡 Keep providing excellent services to see personalized analytics.");
        }
    }
}
