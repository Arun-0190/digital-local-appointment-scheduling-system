package com.dlass.backend.service;

import com.dlass.backend.model.Appointment;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.AppointmentRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final EmailService emailService;

    public ReminderService(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            ServiceProviderRepository serviceProviderRepository,
            EmailService emailService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 300000)              //every 5 minutes
    public void sendReminders() {
        try {
            System.out.println("[ReminderService] Checking for upcoming appointments to send reminders...");

            List<Appointment> appointments = appointmentRepository.findAll();
            LocalDateTime now = LocalDateTime.now();

            for (Appointment appointment : appointments) {
                try {
                    // Skip deleted or non-booked appointments
                    if (appointment.isDeleted() || !"BOOKED".equals(appointment.getStatus())) {
                        continue;
                    }

                    // Robust Check: Old records might have null fields or failed to parse via custom converters
                    if (appointment.getDate() == null || appointment.getStartTime() == null) {
                        // Silent skip or log error? User requested "skip safely"
                        continue;
                    }

                    LocalDateTime appointmentTime =
                            LocalDateTime.of(appointment.getDate(), appointment.getStartTime());

                    long minutesUntil = Duration.between(now, appointmentTime).toMinutes();

                    // Optional handling to prevent crashing the whole loop if data is missing
                    User user = userRepository.findById(appointment.getUserId()).orElse(null);
                    if (user == null || user.getEmail() == null) continue;

                    ServiceProvider provider =
                            serviceProviderRepository.findById(appointment.getProviderId()).orElse(null);
                    if (provider == null) continue;

                    User providerUser =
                            userRepository.findById(provider.getUserId()).orElse(null);
                    if (providerUser == null || providerUser.getEmail() == null) continue;

                    // 24 hour reminder
                    if (minutesUntil <= 1440 && minutesUntil > 60 && !appointment.isReminder24Sent()) {
                        sendReminderEmails(user, providerUser, appointment);
                        appointment.setReminder24Sent(true);
                        appointmentRepository.save(appointment);
                    }
                    // 1 hour reminder
                    else if (minutesUntil <= 60 && minutesUntil > 0 && !appointment.isReminder1hSent()) {
                        sendReminderEmails(user, providerUser, appointment);
                        appointment.setReminder1hSent(true);
                        appointmentRepository.save(appointment);
                    }
                    // meeting start reminder
                    else if (minutesUntil <= 0 && minutesUntil > -15 && !appointment.isReminderStartSent()) {
                        sendReminderEmails(user, providerUser, appointment);
                        appointment.setReminderStartSent(true);
                        appointmentRepository.save(appointment);
                    }
                } catch (Exception e) {
                    System.err.println("[ReminderService] Error processing appointment " + appointment.getId() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[ReminderService] CRITICAL: Failed to run reminder task: " + e.getMessage());
        }
    }

    private void sendReminderEmails(User user, User providerUser, Appointment appointment) {

        String message =
                """
                Appointment Reminder
                
                Date: """ + appointment.getDate() + "\n" +
                "Time: " + appointment.getStartTime();

        emailService.sendEmail(
                user.getEmail(),
                "Appointment Reminder",
                message
        );

        emailService.sendEmail(
                providerUser.getEmail(),
                "Upcoming Appointment Reminder",
                message
        );
    }
}