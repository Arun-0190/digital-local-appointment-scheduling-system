package com.dlass.backend.service;

import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
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

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              ServiceProviderRepository serviceProviderRepository) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
    }

    public Appointment book(AppointmentRequest request, String email) {

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        boolean exists = appointmentRepository
                .existsByProviderIdAndDateAndStartTime(
                        request.getProviderId(),
                        request.getDate(),
                        request.getStartTime());

        if (exists) {
            throw new RuntimeException("Slot already booked");
        }

        Appointment appointment = new Appointment();

        appointment.setProviderId(request.getProviderId());
        appointment.setUserId(userId);
        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus("BOOKED");

        try {
            return appointmentRepository.save(appointment);
        } catch (DuplicateKeyException e) {
            throw new RuntimeException("This slot has already been booked.");
        }
    }

    public void cancelAppointment(String appointmentId, String email) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        //Only the user who booked it can cancel
        if (!appointment.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to cancel this appointment");
        }

        //Build appointment start datetime
        LocalDateTime appointmentTime =
                LocalDateTime.of(appointment.getDate(), appointment.getStartTime());

        LocalDateTime now = LocalDateTime.now();

        // Check 30-minute rule
        if (Duration.between(now, appointmentTime).toMinutes() < 30) {
            throw new RuntimeException("Appointment cannot be cancelled within 30 minutes of start time");
        }

        appointmentRepository.deleteById(appointmentId);
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