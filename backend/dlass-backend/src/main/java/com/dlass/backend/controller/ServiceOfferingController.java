package com.dlass.backend.controller;

import com.dlass.backend.model.ServiceOffering;
import com.dlass.backend.service.ServiceOfferingService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    public ServiceOfferingController(ServiceOfferingService service) {
        this.service = service;
    }

    @PostMapping
    public ServiceOffering createService(@RequestBody ServiceOffering serviceOffering,
                                         Authentication authentication) {

        String email = authentication.getName();

        return service.create(serviceOffering, email);
    }

    @GetMapping("/provider/{providerId}")
    public List<ServiceOffering> getProviderServices(@PathVariable String providerId) {

        return service.getProviderServices(providerId);
    }

    @PutMapping("/{serviceId}")
    public ServiceOffering updateService(
            @PathVariable String serviceId,
            @RequestBody ServiceOffering updatedService,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return service.updateService(serviceId, updatedService, email);
    }

    @DeleteMapping("/{serviceId}")
    public String deleteService(
            @PathVariable String serviceId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        service.deleteService(serviceId, email);

        return "Service deleted successfully";
    }

    @GetMapping("/my")
    public List<ServiceOffering> getMyServices(Authentication authentication) {

        String email = authentication.getName();

        return service.getMyServices(email);
    }

}