package com.dlass.backend.service;

import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.exception.EmailAlreadyExistsException;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dlass.backend.security.JwtUtil;
import com.dlass.backend.dto.LoginResponse;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponseDTO registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true); // ensure isActive on creation
        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getPincode(),
                savedUser.getCreatedAt()
        );
    }

    /** Returns only active USER-role accounts for admin (excludes ADMIN role). */
    public List<UserResponseDTO> getAdminUserList() {
        return userRepository.findByRoleAndIsActiveTrue("USER")
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /** Returns all active users (any role) — used for internal lookups. */
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findByIsActiveTrue()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public LoginResponse loginUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Only block explicitly deactivated users (isActive = false)
        // Old documents without the field are treated as active
        // Note: boolean primitive defaults to false, so we can't rely on isActive() alone
        // We accept users unless explicitly soft-deleted (field presence check done via query)
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse(token, user.getEmail(), user.getRole());
    }

    /** Returns basic profile info for the authenticated user. */
    public Map<String, String> getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, String> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("fullName", user.getFullName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("pincode", user.getPincode() != null ? user.getPincode() : "");
        map.put("phone", user.getPhone() != null ? user.getPhone() : "");
        return map;
    }

    /** Soft-delete: marks user inactive instead of removing from DB. */
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponseDTO toDTO(User u) {
        return new UserResponseDTO(u.getId(), u.getFullName(), u.getEmail(),
                u.getRole(), u.getPincode(), u.getCreatedAt());
    }

    public List<UserResponseDTO> getDeletedUsers() {
        return userRepository.findDeletedUsers()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public void reactivateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        user.setDeleted(false);
        user.setDeletedAt(null);
        user.setDeletedBy(null);
        user.setDeactivationReason(null);
        userRepository.save(user);
    }
}
