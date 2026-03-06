package com.dlass.backend.service;

import com.dlass.backend.dto.TimeSlotDTO;
import com.dlass.backend.exception.AvailabilityConflictException;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ProviderAvailability;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.repository.ProviderAvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProviderAvailabilityService {

    private final ProviderAvailabilityRepository repository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public ProviderAvailabilityService(
            ProviderAvailabilityRepository repository,
            ServiceProviderRepository serviceProviderRepository,
            UserRepository userRepository, AppointmentRepository appointmentRepository) {

        this.repository = repository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
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

    public List<TimeSlotDTO> generateSlots(ProviderAvailability availability, LocalDate date) {

        List<TimeSlotDTO> slots = new ArrayList<>();

        List<Appointment> appointments =
                appointmentRepository.findByProviderIdAndDate(
                        availability.getProviderId(), date
                );

        Set<LocalTime> bookedSlots = appointments.stream()
                .map(Appointment::getStartTime)
                .collect(Collectors.toSet());

        LocalTime current = availability.getStartTime();
        int duration = availability.getSlotDuration();

        while (!current.plusMinutes(duration).isAfter(availability.getEndTime())) {
            LocalTime slotEnd = current.plusMinutes(duration);
            boolean available = !bookedSlots.contains(current);
            slots.add(new TimeSlotDTO(current, slotEnd, available));
            current = slotEnd;
        }

        return slots;
    }

    public List<TimeSlotDTO> getSlots(String availabilityId, LocalDate date) {

        ProviderAvailability availability = repository
                .findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        return generateSlots(availability, date);
    }

    public Map<LocalDate, List<TimeSlotDTO>> getWeeklyCalendar(String providerId, LocalDate startDate) {

        Map<LocalDate, List<TimeSlotDTO>> calendar = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            List<ProviderAvailability> availabilities =
                    repository.findByProviderIdAndDayOfWeek(providerId, date.getDayOfWeek());

            List<TimeSlotDTO> slots = new ArrayList<>();
            for (ProviderAvailability availability : availabilities) {
                slots.addAll(generateSlots(availability, date));
            }
            calendar.put(date, slots);
        }

        return calendar;
    }
}