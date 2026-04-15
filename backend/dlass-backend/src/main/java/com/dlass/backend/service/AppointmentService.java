package com.dlass.backend.service;

import com.dlass.backend.dto.AppointmentDetailDTO;
import com.dlass.backend.dto.AppointmentRequest;
import com.dlass.backend.dto.AppointmentResponse;
import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceOffering;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceOfferingRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.model.SlotLock;
import com.dlass.backend.repository.SlotLockRepository;
import com.dlass.backend.model.PlatformConfig;
import com.dlass.backend.repository.PlatformConfigRepository;
import com.dlass.backend.model.NotificationType;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final SlotLockRepository slotLockRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PlatformConfigRepository platformConfigRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              ServiceProviderRepository serviceProviderRepository,
                              ServiceOfferingRepository serviceOfferingRepository,
                              SlotLockRepository slotLockRepository,
                              EmailService emailService,
                              NotificationService notificationService,
                              PlatformConfigRepository platformConfigRepository) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.slotLockRepository = slotLockRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.platformConfigRepository = platformConfigRepository;
    }

    private PlatformConfig getConfig() {
        return platformConfigRepository.findAll().stream().findFirst().orElseGet(() -> {
            PlatformConfig config = new PlatformConfig();
            config.setCancellationMinutes(30);
            config.setSlotLockMinutes(5);
            return platformConfigRepository.save(config);
        });
    }

    public Appointment book(AppointmentRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userId = user.getId();

        List<Appointment> existing =
                appointmentRepository.findByProviderIdAndDate(
                        request.getProviderId(),
                        request.getDate()
                );

        // Strict overlap check: existing.start < newEnd AND existing.end > newStart
        boolean alreadyBooked = existing.stream()
                .filter(a -> !"CANCELLED".equals(a.getStatus()))
                .anyMatch(a ->
                        a.getStartTime().isBefore(request.getEndTime())
                                && a.getEndTime().isAfter(request.getStartTime())
                );

        if (alreadyBooked) {
            throw new RuntimeException("Slot already booked");
        }

        // Slot Lock Check
        cleanUpLocks();
        slotLockRepository.findByProviderIdAndDateAndStartTime(
                request.getProviderId(), request.getDate(), request.getStartTime()
        ).ifPresent(lock -> {
            if (!lock.getUserId().equals(userId)) {
                throw new RuntimeException("Slot is currently locked by another user");
            }
        });

        // Fetch service details if serviceId provided
        String serviceName = null;
        double amount = 0;
        if (request.getServiceId() != null) {
            ServiceOffering offering = serviceOfferingRepository.findById(request.getServiceId()).orElse(null);
            if (offering != null) {
                serviceName = offering.getName();
                amount = offering.getPrice();
            }
        }

        Appointment appointment = new Appointment();

        appointment.setProviderId(request.getProviderId());
        appointment.setUserId(userId);
        appointment.setServiceId(request.getServiceId());
        appointment.setServiceName(serviceName);
        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus("BOOKED");
        appointment.setAmount(amount);
        appointment.setCreatedAt(LocalDateTime.now());

        try {

            Appointment saved = appointmentRepository.save(appointment);

            // PROVIDER notification email
            ServiceProvider provider = serviceProviderRepository
                    .findById(saved.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));

            User providerUser = userRepository
                    .findById(provider.getUserId())
                    .orElseThrow(() -> new RuntimeException("Provider user not found"));

            // USER confirmation email
            emailService.sendEmail(
                    user.getEmail(),
                    "Appointment Confirmed",
                    "Your appointment is confirmed:\n"
                            + "Service: " + serviceName + "\n"
                            + "Time: " + saved.getStartTime() + "\n"
                            + "Provider: " + provider.getBusinessName()
            );

            emailService.sendEmail(
                    providerUser.getEmail(),
                    "New Appointment Booked",
                    "A new appointment has been booked.\n"
                            + "Customer: " + user.getFullName() + "\n"
                            + "Date: " + saved.getDate() + "\n"
                            + "Time: " + saved.getStartTime()
            );

            notificationService.createNotification(
                    providerUser.getId(),
                    "New appointment booked by " + user.getFullName() + " on " + saved.getDate(),
                    NotificationType.APPOINTMENT,
                    saved.getId(),
                    "/provider-dashboard"
            );

            notificationService.createNotification(
                    userId,
                    "Your appointment with " + provider.getBusinessName() + " has been booked for " + saved.getDate(),
                    NotificationType.APPOINTMENT,
                    saved.getId(),
                    "/dashboard"
            );

            // Free lock if any
            slotLockRepository.deleteByProviderIdAndDateAndStartTime(
                    request.getProviderId(), request.getDate(), request.getStartTime()
            );

            return saved;

        } catch (DuplicateKeyException e) {
            throw new RuntimeException("This slot has already been booked.");
        }
    }

    private void cleanUpLocks() {
        slotLockRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    public void lockSlot(AppointmentRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        cleanUpLocks();

        List<Appointment> existing = appointmentRepository.findByProviderIdAndDate(
                request.getProviderId(), request.getDate()
        );

        boolean alreadyBooked = existing.stream()
                .filter(a -> !"CANCELLED".equals(a.getStatus()))
                .anyMatch(a -> a.getStartTime().isBefore(request.getEndTime()) && a.getEndTime().isAfter(request.getStartTime()));

        if (alreadyBooked) throw new RuntimeException("Slot already booked");

        slotLockRepository.findByProviderIdAndDateAndStartTime(
                request.getProviderId(), request.getDate(), request.getStartTime()
        ).ifPresent(lock -> {
            if (!lock.getUserId().equals(user.getId())) {
                throw new RuntimeException("Slot is already locked by another user");
            }
        });

        // Save new lock
        SlotLock lock = new SlotLock();
        lock.setProviderId(request.getProviderId());
        lock.setDate(request.getDate());
        lock.setStartTime(request.getStartTime());
        lock.setLockedAt(LocalDateTime.now());
        lock.setExpiresAt(LocalDateTime.now().plusMinutes(getConfig().getSlotLockMinutes()));
        lock.setUserId(user.getId());
        slotLockRepository.save(lock);
    }

    public Appointment reschedule(String appointmentId, AppointmentRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getUserId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to reschedule this appointment");
        }

        cleanUpLocks();

        List<Appointment> existing = appointmentRepository.findByProviderIdAndDate(
                request.getProviderId(), request.getDate()
        );

        boolean alreadyBooked = existing.stream()
                .filter(a -> !"CANCELLED".equals(a.getStatus()) && !a.getId().equals(appointmentId))
                .anyMatch(a -> a.getStartTime().isBefore(request.getEndTime()) && a.getEndTime().isAfter(request.getStartTime()));

        if (alreadyBooked) throw new RuntimeException("Slot already booked");

        slotLockRepository.findByProviderIdAndDateAndStartTime(
                request.getProviderId(), request.getDate(), request.getStartTime()
        ).ifPresent(lock -> {
            if (!lock.getUserId().equals(user.getId())) {
                throw new RuntimeException("Slot is currently locked by another user");
            }
        });

        appointment.setDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        
        slotLockRepository.deleteByProviderIdAndDateAndStartTime(
                request.getProviderId(), request.getDate(), request.getStartTime()
        );
        
        Appointment saved = appointmentRepository.save(appointment);

        emailService.sendEmail(
                user.getEmail(),
                "Appointment Rescheduled",
                "Your appointment has been successfully rescheduled to: " + saved.getDate() + " at " + saved.getStartTime()
        );
        
        ServiceProvider provider = serviceProviderRepository.findById(saved.getProviderId()).orElse(null);
        if (provider != null) {
            User pUser = userRepository.findById(provider.getUserId()).orElse(null);
            if (pUser != null) {
                emailService.sendEmail(
                    pUser.getEmail(),
                    "Appointment Rescheduled",
                    "A customer has rescheduled their appointment to: " + saved.getDate() + " at " + saved.getStartTime()
                );
            }
        }

        return saved;
    }

    public void cancelAppointment(String appointmentId, String email) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userId = user.getId();

        if (!appointment.getUserId().equals(userId)) {
            throw new RuntimeException("You are not allowed to cancel this appointment");
        }

        LocalDateTime appointmentTime =
                LocalDateTime.of(appointment.getDate(), appointment.getStartTime());

        LocalDateTime now = LocalDateTime.now();

        if (appointmentTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel an appointment that has already passed");
        }

        if (Duration.between(now, appointmentTime).toMinutes() < getConfig().getCancellationMinutes()) {
            throw new RuntimeException("Appointment cannot be cancelled within " + getConfig().getCancellationMinutes() + " minutes of start time");
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // USER cancellation email
        emailService.sendEmail(
                user.getEmail(),
                "Appointment Cancelled",
                "Your appointment has been cancelled"
        );

        // PROVIDER cancellation email
        ServiceProvider provider = serviceProviderRepository
                .findById(appointment.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        User providerUser = userRepository
                .findById(provider.getUserId())
                .orElseThrow(() -> new RuntimeException("Provider user not found"));

        emailService.sendEmail(
                providerUser.getEmail(),
                "Appointment Cancelled",
                "An appointment has been cancelled.\n"
                        + "Customer: " + user.getFullName() + "\n"
                        + "Date: " + appointment.getDate() + "\n"
                        + "Time: " + appointment.getStartTime()
        );

        notificationService.createNotification(
                userId,
                "You have successfully cancelled your appointment with " + provider.getBusinessName(),
                NotificationType.APPOINTMENT,
                appointment.getId(),
                "/dashboard"
        );

        notificationService.createNotification(
                providerUser.getId(),
                "An appointment was cancelled by " + user.getFullName(),
                NotificationType.APPOINTMENT,
                appointment.getId(),
                "/provider-dashboard"
        );
    }

    private AppointmentResponse mapToResponse(Appointment a) {
        AppointmentResponse res = new AppointmentResponse();
        res.setId(a.getId());
        res.setServiceName(a.getServiceName());
        res.setDate(a.getDate());
        res.setStartTime(a.getStartTime());
        res.setEndTime(a.getEndTime());
        res.setStatus(a.getStatus());
        res.setAmount(a.getAmount());
        res.setUserId(a.getUserId());
        return res;
    }

    public List<com.dlass.backend.dto.AppointmentResponse> getUserAppointments(String email) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<Appointment> apps = appointmentRepository.findByUserId(userId);
        LocalDateTime now = LocalDateTime.now();

        apps.forEach(a -> {
            if ("BOOKED".equals(a.getStatus()) && LocalDateTime.of(a.getDate(), a.getEndTime()).isBefore(now)) {
                a.setStatus("COMPLETED");
                appointmentRepository.save(a);
            }
        });

        return apps.stream().map(a -> {
            AppointmentResponse dto = mapToResponse(a);
            ServiceProvider sp = serviceProviderRepository.findById(a.getProviderId()).orElse(null);
            if (sp != null) {
                dto.setProviderName(sp.getBusinessName());
                dto.setProviderUserId(sp.getUserId());
                User pUser = userRepository.findById(sp.getUserId()).orElse(null);
                if (pUser != null) {
                    dto.setProviderEmail(pUser.getEmail());
                    dto.setProviderPhone(pUser.getPhone());
                }
            }
            return dto;
        }).toList();
    }

    public List<com.dlass.backend.dto.AppointmentResponse> getProviderAppointments(String email, LocalDate date) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        ServiceProvider provider = serviceProviderRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        List<Appointment> apps;
        if (date != null) {
            apps = appointmentRepository.findByProviderIdAndDate(provider.getId(), date);
        } else {
            apps = appointmentRepository.findByProviderId(provider.getId());
        }

        LocalDateTime now = LocalDateTime.now();

        apps.forEach(a -> {
            if ("BOOKED".equals(a.getStatus()) && LocalDateTime.of(a.getDate(), a.getEndTime()).isBefore(now)) {
                a.setStatus("COMPLETED");
                appointmentRepository.save(a);
            }
        });

        return apps.stream().map(a -> {
            AppointmentResponse dto = mapToResponse(a);
            dto.setProviderUserId(userId);
            User u = userRepository.findById(a.getUserId()).orElse(null);
            if (u != null) {
                dto.setUserName(u.getFullName());
                dto.setUserEmail(u.getEmail());
                dto.setUserPhone(u.getPhone());
            }
            return dto;
        }).toList();
    }

    /** Provider cancels an appointment they own. No time restriction. */
    public void cancelByProvider(String appointmentId, String email) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = serviceProviderRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (!appointment.getProviderId().equals(provider.getId())) {
            throw new RuntimeException("You are not the provider for this appointment");
        }

        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);

        // Notify the customer
        User customer = userRepository.findById(appointment.getUserId()).orElse(null);
        if (customer != null) {
            emailService.sendEmail(
                    customer.getEmail(),
                    "Appointment Cancelled by Provider",
                    "Your appointment has been cancelled by the service provider.\n"
                            + "Date: " + appointment.getDate() + "\n"
                            + "Time: " + appointment.getStartTime()
            );

            notificationService.createNotification(
                    customer.getId(),
                    "Your appointment with " + provider.getBusinessName() + " has been cancelled.",
                    NotificationType.APPOINTMENT,
                    appointment.getId(),
                    "/dashboard"
            );
        }

        notificationService.createNotification(
                provider.getUserId(),
                "You cancelled the appointment with " + (customer != null ? customer.getFullName() : "the customer"),
                NotificationType.APPOINTMENT,
                appointment.getId(),
                "/provider-dashboard"
        );
    }

    // ── Feature 3: Appointment Detail ────────────────────────────────────────

    /**
     * Returns full appointment details including user and provider contact info.
     * Both USER and PROVIDER can access their own appointments by id.
     */
    public AppointmentDetailDTO getAppointmentById(String appointmentId, String email) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security: only the user or their provider may view this appointment
        boolean isOwner = a.getUserId().equals(caller.getId());
        boolean isProvider = serviceProviderRepository.findByUserId(caller.getId())
                .map(sp -> sp.getId().equals(a.getProviderId()))
                .orElse(false);
        if (!isOwner && !isProvider) {
            throw new RuntimeException("Access denied");
        }

        AppointmentDetailDTO dto = new AppointmentDetailDTO();
        dto.setAppointmentId(a.getId());
        dto.setServiceName(a.getServiceName());
        dto.setDate(a.getDate());
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        dto.setStatus(a.getStatus());
        dto.setAmount(a.getAmount());

        // User contact
        User user = userRepository.findById(a.getUserId()).orElse(null);
        if (user != null) {
            dto.setUserId(user.getId());
            dto.setUserName(user.getFullName());
            dto.setUserEmail(user.getEmail());
            dto.setUserPhone(user.getPhone());
        }

        // Provider contact (via the provider's linked user account)
        ServiceProvider sp = serviceProviderRepository.findById(a.getProviderId()).orElse(null);
        if (sp != null) {
            dto.setProviderId(sp.getId());
            dto.setProviderUserId(sp.getUserId());
            dto.setProviderName(sp.getBusinessName());
            User providerUser = userRepository.findById(sp.getUserId()).orElse(null);
            if (providerUser != null) {
                dto.setProviderEmail(providerUser.getEmail());
                dto.setProviderPhone(providerUser.getPhone());
            }
        }

        return dto;
    }

    // ── Feature 6: Appointment History ───────────────────────────────────────

    /**
     * Returns appointment history for the caller (USER or PROVIDER) filtered by
     * the last {@code days} days (default 30). Optionally filters by serviceId
     * (category/subcategory filtering happens client-side or via serviceId).
     */
    public List<AppointmentResponse> getHistory(
            String email, int days, String serviceId, String subcategoryId) {

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusDays(days);

        List<Appointment> apps;

        // Determine if caller is a provider or a regular user
        java.util.Optional<ServiceProvider> spOpt = serviceProviderRepository.findByUserId(caller.getId());
        if (spOpt.isPresent() && "PROVIDER".equals(caller.getRole())) {
            apps = appointmentRepository
                    .findByProviderIdAndDateBetween(spOpt.get().getId(), from, to);
        } else {
            apps = appointmentRepository
                    .findByUserIdAndDateBetween(caller.getId(), from, to);
        }

        // Optional serviceId filter
        if (serviceId != null && !serviceId.isBlank()) {
            apps = apps.stream()
                    .filter(a -> serviceId.equals(a.getServiceId()))
                    .toList();
        }

        return apps.stream().map(a -> {
            AppointmentResponse dto = mapToResponse(a);
            // Populate provider info for user-view
            ServiceProvider sp = serviceProviderRepository.findById(a.getProviderId()).orElse(null);
            if (sp != null) {
                dto.setProviderName(sp.getBusinessName());
                dto.setProviderUserId(sp.getUserId());
                User pUser = userRepository.findById(sp.getUserId()).orElse(null);
                if (pUser != null) {
                    dto.setProviderEmail(pUser.getEmail());
                    dto.setProviderPhone(pUser.getPhone());
                }
            }
            // Populate user info for provider-view
            User u = userRepository.findById(a.getUserId()).orElse(null);
            if (u != null) {
                dto.setUserName(u.getFullName());
                dto.setUserEmail(u.getEmail());
                dto.setUserPhone(u.getPhone());
            }
            return dto;
        }).toList();
    }
}
