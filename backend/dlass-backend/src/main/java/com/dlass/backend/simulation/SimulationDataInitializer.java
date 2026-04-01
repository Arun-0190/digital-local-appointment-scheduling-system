package com.dlass.backend.simulation;

import com.dlass.backend.model.*;
import com.dlass.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class SimulationDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public SimulationDataInitializer(UserRepository userRepository, 
                                     ServiceProviderRepository providerRepository, 
                                     AppointmentRepository appointmentRepository, 
                                     ReviewRepository reviewRepository, 
                                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.appointmentRepository = appointmentRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String KAMLESH_ID = "69c8f55313de1c936d29e8f2";
        
        // Check if simulation is already present
        if (reviewRepository.countByProviderId(KAMLESH_ID) > 10) {
            return; // Skip if already seeded
        }

        System.out.println(">>> [SIMULATION] Starting automatic high-fidelity seeding for Kamlesh Deora...");

        List<String> firstNames = Arrays.asList("Arjun", "Deepak", "Sneha", "Anjali", "Vikram", "Rohan", "Pooja", "Meera", "Karan", "Suresh");
        List<String> lastNames = Arrays.asList("Sharma", "Verma", "Gupta", "Malhotra", "Mehta", "Singh", "Joshi", "Patel", "Reddy", "Iyer");
        List<String> comments = Arrays.asList(
            "Excellent service and very professional!",
            "The doctor was very patient and explained everything clearly.",
            "Highly recommended for quick and effective treatment.",
            "Very punctual and detailed checkup. Great experience.",
            "Professional behavior and clean clinic environment.",
            "One of the best experiences I have had with a local provider.",
            "Very satisfied with the consultation. Worth the wait.",
            "Knowledgeable and friendly. Made me feel at ease."
        );

        String[] services = {"OPD Consultation", "Fever Treatment", "Health Checkup"};
        
        List<User> users = new ArrayList<>();
        List<Appointment> appointments = new ArrayList<>();
        List<Review> reviews = new ArrayList<>();

        String bakedPassword = passwordEncoder.encode("123456");
        
        // Generate 800 Users
        for (int i = 0; i < 800; i++) {
            User user = new User();
            user.setId(UUID.randomUUID().toString().substring(0, 24));
            user.setFullName(firstNames.get(i % 10) + " " + lastNames.get(ThreadLocalRandom.current().nextInt(10)));
            user.setEmail("sim_user_" + i + "@demo.com");
            user.setPassword(bakedPassword);
            user.setRole("USER");
            user.setPincode("110001");
            users.add(user);
        }
        userRepository.saveAll(users);

        LocalDate today = LocalDate.now();
        int userIdx = 0;

        // Generate ~800 Appointments across 30 days (targeting 26+ per day)
        for (int d = 0; d < 30; d++) {
            LocalDate date = today.minusDays(d);
            int dailyCount = 25 + ThreadLocalRandom.current().nextInt(10);
            
            for (int a = 0; a < dailyCount; a++) {
                if (userIdx >= users.size()) break;
                User user = users.get(userIdx++);

                Appointment appt = new Appointment();
                appt.setId(UUID.randomUUID().toString().substring(0, 24));
                appt.setUserId(user.getId());
                appt.setProviderId(KAMLESH_ID);
                appt.setDate(date);
                appt.setStartTime(LocalTime.of(9 + (a % 8), (a * 15) % 60));
                appt.setEndTime(appt.getStartTime().plusMinutes(15));
                appt.setStatus("COMPLETED");
                appt.setServiceName(services[a % 3]);
                appt.setAmount(400.0);
                appointments.add(appt);

                // Weighted Rating for 4.8 Avg (80% 5-star, 20% 4-star)
                int rating = (ThreadLocalRandom.current().nextDouble() < 0.8) ? 5 : 4;
                
                Review review = new Review();
                review.setId(UUID.randomUUID().toString().substring(0, 24));
                review.setProviderId(KAMLESH_ID);
                review.setUserId(user.getId());
                review.setAppointmentId(appt.getId());
                review.setRating(rating);
                review.setComment(comments.get(ThreadLocalRandom.current().nextInt(comments.size())));
                review.setCreatedAt(LocalDateTime.of(date, appt.getEndTime()));
                reviews.add(review);
            }
        }
        appointmentRepository.saveAll(appointments);
        reviewRepository.saveAll(reviews);

        // Update Provider Record
        providerRepository.findById(KAMLESH_ID).ifPresent(p -> {
            p.setRating(4.8);
            p.setReviewCount(reviews.size());
            providerRepository.save(p);
        });

        System.out.println(">>> [SIMULATION] Automatic seeding complete. Seeded " + users.size() + " users and " + appointments.size() + " records.");
    }
}
