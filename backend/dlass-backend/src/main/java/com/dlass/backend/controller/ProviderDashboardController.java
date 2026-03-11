package com.dlass.backend.controller;

import com.dlass.backend.dto.ProviderDashboardDTO;
import com.dlass.backend.service.ProviderDashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/provider/dashboard")
public class ProviderDashboardController {

    private final ProviderDashboardService dashboardService;

    public ProviderDashboardController(ProviderDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ProviderDashboardDTO getDashboard(Authentication authentication) {

        String email = authentication.getName();

        return dashboardService.getDashboard(email);
    }
}