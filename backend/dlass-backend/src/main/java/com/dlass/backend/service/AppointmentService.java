package com.dlass.backend.service;

import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceOffering;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceOfferingRepository;
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
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final EmailService emailService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              ServiceProviderRepository serviceProviderRepository,
                              ServiceOfferingRepository serviceOfferingRepository,
                              EmailService emailService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
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

        // Strict overlap check: existing.start < newEnd AND existing.end > newStart
        boolean alreadyBooked = existing.stream()
                .filter(a -> !"CANCELLED".equals(a.getStatus()))
                .anyMatch(a ->
                        a.getStartTime().isBefore(request.getEndTime())
                                && a.getEndTime().isAfter(request.getStartTime())
                );

        if (alreadyBooked) {
            throw new RuntimeException("Slot already booked");
        }

        // Fetch service details if serviceId provided
        String serviceName = null;
        double amount = 0;
        if (request.getServiceId() != null) {
            ServiceOffering offering = serviceOfferingRepository.findById(request.getServiceId()).orElse(null);
            if (offering != null) {
                serviceName = offering.getName();
                amount = offering.getPrice();
            }
        }

        Appointment appointment = new Appointment();

        appointment.setProviderId(request.getProviderId());
        appointment.setUserId(userId);
        appointment.setServiceId(request.getServiceId());
        appointment.setServiceName(serviceName);
        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus("BOOKED");
        appointment.setAmount(amount);
        appointment.setCreatedAt(LocalDateTime.now());

        try {

            Appointment saved = appointmentRepository.save(appointment);

            // PROVIDER notification email
            ServiceProvider provider = serviceProviderRepository
                    .findById(saved.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            User providerUser = userRepository
                    .findById(provider.getUserId())
                    .orElseThrow(() -> new RuntimeException("Provider user not found"));

            // USER confirmation email
            emailService.sendEmail(
                    user.getEmail(),
                    "Appointment Confirmed",
                    "Your appointment is confirmed:\n"
                            + "Service: " + serviceName + "\n"
                            + "Time: " + saved.getStartTime() + "\n"
                            + "Provider: " + provider.getBusinessName()
            );

            emailService.sendEmail(
                    providerUser.getEmail(),
                    "New Appointment Booked",
                    "A new appointment has been booked.\n"
                            + "Customer: " + user.getFullName() + "\n"
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

        if (appointmentTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel an appointment that has already passed");
        }

        if (Duration.between(now, appointmentTime).toMinutes() < 30) {
            throw new RuntimeException("Appointment cannot be cancelled within 30 minutes of start time");
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // USER cancellation email
        emailService.sendEmail(
                user.getEmail(),
                "Appointment Cancelled",
                "Your appointment has been cancelled"
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
                "An appointment has been cancelled.\n"
                        + "Customer: " + user.getFullName() + "\n"
                        + "Date: " + appointment.getDate() + "\n"
                        + "Time: " + appointment.getStartTime()
        );
    }

    private com.dlass.backend.dto.AppointmentResponse mapToResponse(Appointment a) {
        com.dlass.backend.dto.AppointmentResponse res = new com.dlass.backend.dto.AppointmentResponse();
        res.setId(a.getId());
        res.setServiceName(a.getServiceName());
        res.setDate(a.getDate());
        res.setStartTime(a.getStartTime());
        res.setEndTime(a.getEndTime());
        res.setStatus(a.getStatus());
        res.setAmount(a.getAmount());
        return res;
    }

    public List<com.dlass.backend.dto.AppointmentResponse> getUserAppointments(String email) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<Appointment> apps = appointmentRepository.findByUserId(userId);
        LocalDateTime now = LocalDateTime.now();

        apps.forEach(a -> {
            if ("BOOKED".equals(a.getStatus()) && LocalDateTime.of(a.getDate(), a.getEndTime()).isBefore(now)) {
                a.setStatus("COMPLETED");
                appointmentRepository.save(a);
            }
        });

        return apps.stream().map(a -> {
            com.dlass.backend.dto.AppointmentResponse dto = mapToResponse(a);
            ServiceProvider sp = serviceProviderRepository.findById(a.getProviderId()).orElse(null);
            if (sp != null) {
                dto.setProviderName(sp.getBusinessName());
                User pUser = userRepository.findById(sp.getUserId()).orElse(null);
                if (pUser != null) dto.setProviderEmail(pUser.getEmail());
            }
            return dto;
        }).toList();
    }

    public List<com.dlass.backend.dto.AppointmentResponse> getProviderAppointments(String email, LocalDate date) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<Appointment> apps;
        if (date != null) {
            apps = appointmentRepository.findByProviderIdAndDate(provider.getId(), date);
        } else {
            apps = appointmentRepository.findByProviderId(provider.getId());
        }

        LocalDateTime now = LocalDateTime.now();

        apps.forEach(a -> {
            if ("BOOKED".equals(a.getStatus()) && LocalDateTime.of(a.getDate(), a.getEndTime()).isBefore(now)) {
                a.setStatus("COMPLETED");
                appointmentRepository.save(a);
            }
        });

        return apps.stream().map(a -> {
            com.dlass.backend.dto.AppointmentResponse dto = mapToResponse(a);
            User u = userRepository.findById(a.getUserId()).orElse(null);
            if (u != null) {
                dto.setUserName(u.getFullName());
                dto.setUserEmail(u.getEmail());
            }
            return dto;
        }).toList();
    }
}