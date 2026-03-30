package com.dlass.backend.controller;

import com.dlass.backend.dto.BookingsWeekDTO;
import com.dlass.backend.dto.PeakHourDTO;
import com.dlass.backend.dto.ProviderDashboardDTO;
import com.dlass.backend.dto.RevenueMonthDTO;
import com.dlass.backend.service.ProviderDashboardService;
import com.dlass.backend.service.RecommendationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provider/dashboard")
public class ProviderDashboardController {

    private final ProviderDashboardService dashboardService;
    private final RecommendationService recommendationService;

    public ProviderDashboardController(ProviderDashboardService dashboardService,
                                       RecommendationService recommendationService) {
        this.dashboardService = dashboardService;
        this.recommendationService = recommendationService;
    }

    /** Existing summary endpoint — unchanged */
    @GetMapping
    public ProviderDashboardDTO getDashboard(Authentication authentication) {
        return dashboardService.getDashboard(authentication.getName());
    }

    /** Feature 1a: Bookings last range grouped by date */
    @GetMapping("/bookings-week")
    public List<BookingsWeekDTO> getBookingsWeek(Authentication authentication, @RequestParam(required = false, defaultValue = "7d") String range) {
        return dashboardService.getBookingsPerWeek(authentication.getName(), range);
    }

    /** Feature 1b: Revenue last range grouped by month/date (COMPLETED only) */
    @GetMapping("/revenue-month")
    public List<RevenueMonthDTO> getRevenueMonth(Authentication authentication, @RequestParam(required = false, defaultValue = "7d") String range) {
        return dashboardService.getRevenuePerMonth(authentication.getName(), range);
    }

    /** Feature 1c: Peak hours — booking count grouped by hour, sorted highest first */
    @GetMapping("/peak-hours")
    public List<PeakHourDTO> getPeakHours(Authentication authentication, @RequestParam(required = false, defaultValue = "7d") String range) {
        return dashboardService.getPeakHours(authentication.getName(), range);
    }

    /** Feature 3: AI rule-based recommendations */
    @GetMapping("/recommendations")
    public List<String> getRecommendations(Authentication authentication, @RequestParam(required = false, defaultValue = "7d") String range) {
        return recommendationService.getRecommendations(authentication.getName(), range);
    }
}