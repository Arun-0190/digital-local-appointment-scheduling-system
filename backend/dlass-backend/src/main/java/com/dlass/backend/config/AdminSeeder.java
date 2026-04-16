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

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name:DLASS Admin}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                return;
            }

            // Strictly additive: Only seed if NO admin exists
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .count();
            
            if (adminCount == 0) {
                User admin = new User();
                admin.setFullName(adminName != null && !adminName.isBlank() ? adminName : "DLASS Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole("ADMIN");
                admin.setActive(true);
                admin.setDeleted(false);
                admin.setCreatedAt(LocalDateTime.now());
                userRepository.save(admin);
                System.out.println("[DLASS] Initial Admin Account Created: " + adminEmail);
            } else {
                System.out.println("[DLASS] Production Check: " + adminCount + " admin(s) present. skipping seeder.");
            }

        } catch (Exception e) {
            System.err.println("[DLASS] WARNING: Startup seeder check failed: " + e.getMessage());
        }
    }
}