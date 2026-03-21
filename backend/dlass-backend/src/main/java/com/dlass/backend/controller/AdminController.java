package com.dlass.backend.controller;

import com.dlass.backend.model.ServiceProvider;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.dlass.backend.service.ServiceProviderService;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final ServiceProviderService serviceProviderService;

    public AdminController(ServiceProviderService serviceProviderService) {
        this.serviceProviderService = serviceProviderService;
    }

    @GetMapping("/test")
    public String adminAccess() {
        return "Admin access granted";
    }

    @GetMapping("/providers/pending")
    public List<ServiceProvider> getPendingProviders() {
        return serviceProviderService.getPendingProviders();
    }

    //For Approval of Provider
    @PostMapping("/providers/{id}/approve")
    public ServiceProvider approveProvider(@PathVariable String id) {
        return serviceProviderService.approve(id);
    }

    @PostMapping("/providers/{id}/reject")
    public ServiceProvider rejectProvider(@PathVariable String id) {
        return serviceProviderService.reject(id);
    }
}