package com.dlass.backend.controller;

import com.dlass.backend.dto.AppointmentDetailDTO;
import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.dto.AppointmentResponse;
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
            Authentication authentication) {
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
    public List<AppointmentResponse> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        return service.getUserAppointments(email);
    }

    @GetMapping("/provider")
    public List<AppointmentResponse> getProviderAppointments(
            @RequestParam(required = false) LocalDate date,
            Authentication authentication) {
        String email = authentication.getName();
        return service.getProviderAppointments(email, date);
    }

    // ── Feature 3: Appointment Detail ─────────────────────────────────────────

    /**
     * GET /api/appointments/{id}
     * Returns full appointment detail including user and provider contact info.
     * Accessible by the owning user or the assigned provider.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDetailDTO> getAppointmentDetail(
            @PathVariable String id,
            Authentication authentication) {
        AppointmentDetailDTO detail = service.getAppointmentById(id, authentication.getName());
        return ResponseEntity.ok(detail);
    }

    // ── Feature 6: Appointment History ────────────────────────────────────────

    /**
     * GET /api/appointments/history?days=30&serviceId=...&subcategoryId=...
     * Returns filtered appointment history for the authenticated user or provider.
     * Default window: last 30 days.
     */
    @GetMapping("/history")
    public List<AppointmentResponse> getHistory(
            @RequestParam(required = false, defaultValue = "30") int days,
            @RequestParam(required = false) String serviceId,
            @RequestParam(required = false) String subcategoryId,
            Authentication authentication) {
        return service.getHistory(authentication.getName(), days, serviceId, subcategoryId);
    }
}