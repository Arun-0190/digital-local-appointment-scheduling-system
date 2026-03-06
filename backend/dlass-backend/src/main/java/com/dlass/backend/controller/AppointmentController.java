package com.dlass.backend.controller;

import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    public Appointment book(@RequestBody AppointmentRequest request,
                            Authentication authentication) {

        String email = authentication.getName();

        return service.book(request, email);
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<String> cancelAppointment(
            @PathVariable String appointmentId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        service.cancelAppointment(appointmentId, email);

        return ResponseEntity.ok("Appointment cancelled successfully");
    }

    @GetMapping("/my")
    public List<Appointment> getMyAppointments(Authentication authentication) {

        String email = authentication.getName();

        return service.getUserAppointments(email);
    }

    @GetMapping("/provider")
    public List<Appointment> getProviderAppointments(
            @RequestParam LocalDate date,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return service.getProviderAppointments(email, date);
    }
}