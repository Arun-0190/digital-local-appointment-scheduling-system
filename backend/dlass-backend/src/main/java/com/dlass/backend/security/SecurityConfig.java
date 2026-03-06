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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()

                        // Public GET categories
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

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

                        //For Service Provider
                        .requestMatchers(HttpMethod.GET, "/api/providers/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/admin/providers/**").hasRole("ADMIN")

                        //For Provider Availability
                        .requestMatchers(HttpMethod.POST, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/provider-availability/**").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider-availability/**").permitAll()

                        //Appointment Booking
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").hasAnyRole("USER", "PROVIDER")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/provider").hasRole("PROVIDER")
                        .requestMatchers(HttpMethod.GET, "/api/provider-availability/calendar/**").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
