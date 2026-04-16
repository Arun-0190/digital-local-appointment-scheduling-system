package com.dlass.backend.config;

import com.dlass.backend.model.User;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoIterable;

import java.time.LocalDateTime;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final PasswordEncoder passwordEncoder;
    private final MongoTemplate mongoTemplate;
    private final MongoClient mongoClient;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name:DLASS Admin}")
    private String adminName;

    public AdminSeeder(UserRepository userRepository, 
                       ServiceProviderRepository providerRepository,
                       PasswordEncoder passwordEncoder, 
                       MongoTemplate mongoTemplate,
                       MongoClient mongoClient) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.passwordEncoder = passwordEncoder;
        this.mongoTemplate = mongoTemplate;
        this.mongoClient = mongoClient;
    }

    @Override
    public void run(String... args) {
        try {
            // DATABASE DIAGNOSTICS
            String dbName = mongoTemplate.getDb().getName();
            System.out.println("[DLASS] Active Database Connection: " + dbName);

            // Protective Admin Seeding: Only runs if NO admin exists
            if (adminEmail != null && !adminEmail.isBlank()) {
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
                    System.out.println("[DLASS] Emergency Admin Seeded: " + adminEmail);
                } else {
                    System.out.println("[DLASS] System verified: " + adminCount + " admin(s) present in " + dbName);
                }
            }

        } catch (Exception e) {
            System.err.println("[DLASS] Startup Check Error: " + e.getMessage());
        }
    }
}