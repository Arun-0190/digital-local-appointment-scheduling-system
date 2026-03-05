package com.dlass.backend.controller;

import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.service.ServiceProviderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ServiceProviderController {

    private final ServiceProviderService service;

    public ServiceProviderController(ServiceProviderService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ServiceProvider register(
            @RequestBody ServiceProvider provider,
            Authentication authentication) {

        String email = authentication.getName();

        return service.register(provider, email);
    }

    @GetMapping("/by-subcategory/{id}")
    public List<ServiceProvider> getBySubCategory(@PathVariable String id) {
        return service.getBySubCategory(id);
    }

}