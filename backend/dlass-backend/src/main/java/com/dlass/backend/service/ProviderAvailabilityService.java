package com.dlass.backend.service;

import com.dlass.backend.dto.TimeSlotDTO;
import com.dlass.backend.exception.AvailabilityConflictException;
import com.dlass.backend.model.ProviderAvailability;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.repository.ProviderAvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProviderAvailabilityService {

    private final ProviderAvailabilityRepository repository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final UserRepository userRepository;

    public ProviderAvailabilityService(
            ProviderAvailabilityRepository repository,
            ServiceProviderRepository serviceProviderRepository,
            UserRepository userRepository) {

        this.repository = repository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.userRepository = userRepository;
    }

    public ProviderAvailability create(ProviderAvailability availability, String email) {

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        availability.setProviderId(provider.getId());

        List<ProviderAvailability> existing =
                repository.findByProviderIdAndDayOfWeek(
                        provider.getId(),
                        availability.getDayOfWeek()
                );

        if (!availability.getStartTime().isBefore(availability.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time. Overnight schedules are not supported.");
        }

        for (ProviderAvailability slot : existing) {

            if (slot.getStartTime().isBefore(availability.getEndTime()) &&
                    slot.getEndTime().isAfter(availability.getStartTime())) {

                throw new AvailabilityConflictException("Availability overlaps with existing schedule");
            }
        }

        availability.setCreatedAt(LocalDateTime.now());
        availability.setUpdatedAt(LocalDateTime.now());

        return repository.save(availability);
    }

    public List<ProviderAvailability> getByProvider(String providerId) {
        return repository.findByProviderId(providerId);
    }

    public List<TimeSlotDTO> generateSlots(ProviderAvailability availability) {

        List<TimeSlotDTO> slots = new ArrayList<>();

        LocalTime current = availability.getStartTime();
        int duration = availability.getSlotDuration();

        while (!current.plusMinutes(duration).isAfter(availability.getEndTime())) {

            LocalTime slotEnd = current.plusMinutes(duration);

            slots.add(new TimeSlotDTO(current, slotEnd));

            current = slotEnd;
        }

        return slots;
    }

    public List<TimeSlotDTO> getSlots(String availabilityId) {

        ProviderAvailability availability = repository
                .findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        return generateSlots(availability);
    }
}