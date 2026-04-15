package com.dlass.backend.security;

import com.dlass.backend.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import com.dlass.backend.repository.UserRepository;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByEmailAndIsActiveTrue(username)
                .map(u -> User.withUsername(u.getEmail())
                        .password(u.getPassword() != null ? u.getPassword() : "")
                        .roles(u.getRole() != null ? u.getRole().toUpperCase() : "USER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()

                        // Public GET categories
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalog/**").permitAll()

                        // Only ADMIN can modify categories
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        //For Sub Categories
                        .requestMatchers(HttpMethod.GET, "/api/subcategories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/subcategories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/providers/register").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/providers/apply").authenticated()

                        //For Service Provider
                        .requestMatchers(HttpMethod.GET, "/api/providers/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/providers/**").permitAll()
                        
                        // All admin endpoints — require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        //For Provider Availability
                        .requestMatchers(HttpMethod.POST, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider-availability/**").permitAll()

                        //Appointment Booking
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**").hasRole("USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/history").hasAnyRole("USER", "PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/provider").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").hasAnyRole("USER", "PROVIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyRole("USER", "PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider-availability/calendar/**").permitAll()

                        //Reviews
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                        //Dashboard
                        .requestMatchers(HttpMethod.GET, "/api/provider/dashboard").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider/dashboard/**").hasRole("PROVIDER")

                        // Portfolio
                        .requestMatchers(HttpMethod.POST, "/api/provider/upload-image").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider/*/portfolio").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/provider/image/**").hasRole("PROVIDER")

                        // Static uploads (portfolio + avatars)
                        .requestMatchers("/uploads/**").permitAll()

                        // Feature 4+5: User profile management & avatar
                        .requestMatchers(HttpMethod.PUT, "/api/users/profile").hasRole("USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/deactivate").hasRole("USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/delete").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/users/upload-avatar").hasRole("USER")

                        // Feature 4+5: Provider profile management & avatar
                        .requestMatchers(HttpMethod.PUT, "/api/providers/profile").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/providers/deactivate").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.PATCH, "/api/providers/delete").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.POST, "/api/providers/upload-avatar").hasRole("PROVIDER")

                        // Chat
                        .requestMatchers("/api/chat/**").permitAll()

                        // Notifications
                        .requestMatchers("/api/notifications", "/api/notifications/**").authenticated()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
