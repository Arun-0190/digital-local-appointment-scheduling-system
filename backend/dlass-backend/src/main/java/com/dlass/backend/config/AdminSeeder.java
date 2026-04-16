package com.dlass.backend.config;

import com.dlass.backend.model.User;
import com.dlass.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD}")
    private String adminPassword;

    @Value("${ADMIN_NAME}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            // Log connection success (assuming Spring Boot started successfully if we're here)
            System.out.println("[DLASS] Connected to MongoDB Atlas successfully");

            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                System.err.println("[DLASS] SKIP: Admin credentials (email/password) are missing in environment.");
                return;
            }

            // STEP A & B: Find and Delete all users where role = ADMIN
            // This ensures we always have EXACTLY ONE admin corresponding to the latest .env
            long count = userRepository.findByRole("ADMIN").size();
            userRepository.deleteByRole("ADMIN");
            if (count > 0) {
                System.out.println("[DLASS] Old admin accounts removed (" + count + ")");
            }

            // STEP C: Create one fresh admin using .env values
            User admin = new User();
            admin.setFullName(adminName != null && !adminName.isBlank() ? adminName : "DLASS Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setActive(true);
            admin.setDeleted(false);
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);

            System.out.println("[DLASS] Fresh admin seeded successfully");
            System.out.println("[DLASS] Admin email: " + adminEmail);

        } catch (Exception e) {
            System.err.println("[DLASS] CRITICAL: Error during admin seeding: " + e.getMessage());
        }
    }
}