package com.dlass.backend.dto;

import java.util.List;

import com.dlass.backend.model.Review;
import com.dlass.backend.model.ServiceProvider;

public class ProviderProfileResponse {

    private ServiceProvider provider;
    private List<ServiceDTO> services;
    private List<Review> reviews;

    public ProviderProfileResponse(ServiceProvider provider,
                                   List<ServiceDTO> services, List<Review> reviews) {
        this.provider = provider;
        this.services = services;
        this.reviews = reviews;
    }

    public ServiceProvider getProvider() {
        return provider;
    }

    public List<ServiceDTO> getServices() {
        return services;
    }

    public List<Review> getReviews() {
        return reviews;
    }

}