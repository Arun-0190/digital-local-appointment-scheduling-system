package com.dlass.backend.service;

import com.dlass.backend.dto.ProviderDashboardDTO;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.ReviewRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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

        return dto;
    }
}