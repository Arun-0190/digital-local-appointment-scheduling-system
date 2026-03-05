package com.dlass.backend.controller;

import com.dlass.backend.model.ServiceProvider;
import org.springframework.web.bind.annotation.*;
import com.dlass.backend.service.ServiceProviderService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ServiceProviderService serviceProviderService;

    public AdminController(ServiceProviderService serviceProviderService) {
        this.serviceProviderService = serviceProviderService;
    }

    @GetMapping("/test")
    public String adminAccess() {
        return "Admin access granted";
    }

    //For Approval of Provider
    @PatchMapping("/providers/{id}/approve")
    public ServiceProvider approveProvider(@PathVariable String id) {
        return serviceProviderService.approve(id);
    }
}