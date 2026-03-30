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

    @PostMapping("/lock")
    public ResponseEntity<String> lockSlot(@RequestBody AppointmentRequest request, Authentication authentication) {
        service.lockSlot(request, authentication.getName());
        return ResponseEntity.ok("Slot locked successfully");
    }

    @PutMapping("/{appointmentId}/reschedule")
    public Appointment reschedule(@PathVariable String appointmentId, @RequestBody AppointmentRequest request, Authentication authentication) {
        return service.reschedule(appointmentId, request, authentication.getName());
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

    /** Provider-initiated cancellation — no time restriction, validates provider ownership. */
    @PutMapping("/{id}/cancel-by-provider")
    public ResponseEntity<String> cancelByProvider(
            @PathVariable String id,
            Authentication authentication) {
        service.cancelByProvider(id, authentication.getName());
        return ResponseEntity.ok("Appointment cancelled by provider");
    }

    @GetMapping("/my")
    public List<com.dlass.backend.dto.AppointmentResponse> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        return service.getUserAppointments(email);
    }

    @GetMapping("/provider")
    public List<com.dlass.backend.dto.AppointmentResponse> getProviderAppointments(
            @RequestParam(required = false) LocalDate date,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return service.getProviderAppointments(email, date);
    }
}