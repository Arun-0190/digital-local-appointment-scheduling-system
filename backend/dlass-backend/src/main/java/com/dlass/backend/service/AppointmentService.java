package com.dlass.backend.service;

import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final EmailService emailService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              ServiceProviderRepository serviceProviderRepository,
                              EmailService emailService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.emailService = emailService;
    }

    public Appointment book(AppointmentRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userId = user.getId();

        List<Appointment> existing =
                appointmentRepository.findByProviderIdAndDate(
                        request.getProviderId(),
                        request.getDate()
                );

        boolean alreadyBooked = existing.stream()
                .anyMatch(a ->
                        a.getStartTime().equals(request.getStartTime())
                                && a.getEndTime().equals(request.getEndTime())
                                && !"CANCELLED".equals(a.getStatus())
                );

        if (alreadyBooked) {
            throw new RuntimeException("Slot already booked");
        }

        Appointment appointment = new Appointment();

        appointment.setProviderId(request.getProviderId());
        appointment.setUserId(userId);
        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus("BOOKED");
        appointment.setCreatedAt(LocalDateTime.now());

        try {

            Appointment saved = appointmentRepository.save(appointment);

            // USER confirmation email
            emailService.sendEmail(
                    user.getEmail(),
                    "Appointment Confirmed",
                    """
                    Your appointment has been booked successfully.

                    Date: """ + saved.getDate() + "\n"
                            + "Time: " + saved.getStartTime()
            );

            // PROVIDER notification email
            ServiceProvider provider = serviceProviderRepository
                    .findById(saved.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            User providerUser = userRepository
                    .findById(provider.getUserId())
                    .orElseThrow(() -> new RuntimeException("Provider user not found"));

            emailService.sendEmail(
                    providerUser.getEmail(),
                    "New Appointment Booked",
                    """
                    A new appointment has been booked.

                    Customer: """ + user.getFullName() + "\n"
                            + "Date: " + saved.getDate() + "\n"
                            + "Time: " + saved.getStartTime()
            );

            return saved;

        } catch (DuplicateKeyException e) {
            throw new RuntimeException("This slot has already been booked.");
        }
    }

    public void cancelAppointment(String appointmentId, String email) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userId = user.getId();

        if (!appointment.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to cancel this appointment");
        }

        LocalDateTime appointmentTime =
                LocalDateTime.of(appointment.getDate(), appointment.getStartTime());

        LocalDateTime now = LocalDateTime.now();

        if (Duration.between(now, appointmentTime).toMinutes() < 30) {
            throw new RuntimeException("Appointment cannot be cancelled within 30 minutes of start time");
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // USER cancellation email
        emailService.sendEmail(
                user.getEmail(),
                "Appointment Cancelled",
                "Your appointment scheduled on "
                        + appointment.getDate()
                        + " at "
                        + appointment.getStartTime()
                        + " has been cancelled."
        );

        // PROVIDER cancellation email
        ServiceProvider provider = serviceProviderRepository
                .findById(appointment.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        User providerUser = userRepository
                .findById(provider.getUserId())
                .orElseThrow(() -> new RuntimeException("Provider user not found"));

        emailService.sendEmail(
                providerUser.getEmail(),
                "Appointment Cancelled",
                """
                An appointment has been cancelled.

                Customer: """ + user.getFullName() + "\n"
                        + "Date: " + appointment.getDate() + "\n"
                        + "Time: " + appointment.getStartTime()
        );
    }

    public List<Appointment> getUserAppointments(String email) {

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        return appointmentRepository.findByUserId(userId);
    }

    public List<Appointment> getProviderAppointments(String email, LocalDate date) {

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        return appointmentRepository.findByProviderIdAndDate(provider.getId(), date);
    }
}