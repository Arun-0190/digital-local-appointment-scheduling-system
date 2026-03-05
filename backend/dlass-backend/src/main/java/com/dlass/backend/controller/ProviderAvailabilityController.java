package com.dlass.backend.controller;

import com.dlass.backend.dto.TimeSlotDTO;
import com.dlass.backend.model.ProviderAvailability;
import com.dlass.backend.service.ProviderAvailabilityService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider-availability")
public class ProviderAvailabilityController {

    private final ProviderAvailabilityService service;

    public ProviderAvailabilityController(ProviderAvailabilityService service) {
        this.service = service;
    }

    @PostMapping
    public ProviderAvailability createAvailability(
            @RequestBody ProviderAvailability availability,
            Authentication authentication) {

        String email = authentication.getName();

        return service.create(availability, email);
    }

    @GetMapping("/provider/{providerId}")
    public List<ProviderAvailability> getByProvider(
            @PathVariable String providerId) {

        return service.getByProvider(providerId);
    }

    @GetMapping("/{availabilityId}/slots")
    public List<TimeSlotDTO> getSlots(@PathVariable String availabilityId) {
        return service.getSlots(availabilityId);
    }
}