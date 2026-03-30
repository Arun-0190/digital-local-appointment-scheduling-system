package com.dlass.backend.service;

import com.dlass.backend.dto.ProfileUpdateRequest;
import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.exception.EmailAlreadyExistsException;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.dlass.backend.security.JwtUtil;
import com.dlass.backend.dto.LoginResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.avatar.dir:uploads/avatars}")
    private String avatarDir;

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

        return toDTO(savedUser);
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
        map.put("profileImageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "");
        return map;
    }

    /** Soft-delete: marks user inactive instead of removing from DB. */
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    // ── Feature 4: Profile Management ────────────────────────────────────────

    /** Update authenticated user's own profile (name, phone, email). */
    public UserResponseDTO updateProfile(String email, ProfileUpdateRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setFullName(req.getName());
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.setPhone(req.getPhone());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && !req.getEmail().equals(email)) {
            if (userRepository.findByEmail(req.getEmail()).isPresent()) {
                throw new EmailAlreadyExistsException("Email already in use");
            }
            user.setEmail(req.getEmail());
        }

        return toDTO(userRepository.save(user));
    }

    /** Deactivate own account — sets isActive = false. */
    public void deactivateSelf(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        user.setDeactivationReason("Self-deactivated");
        userRepository.save(user);
    }

    /** Soft-delete own account — sets isActive = false, isDeleted = true. */
    public void softDeleteSelf(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedBy(email);
        userRepository.save(user);
    }

    // ── Feature 5: Avatar Upload ──────────────────────────────────────────────

    /** Upload a profile picture, save to /uploads/avatars/, store URL on the user. */
    public UserResponseDTO uploadAvatar(String email, MultipartFile file) throws IOException {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 5 MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + ext;

        Path dir = Paths.get(avatarDir).toAbsolutePath();
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

        String url = "/uploads/avatars/" + filename;
        user.setProfileImageUrl(url);
        return toDTO(userRepository.save(user));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private UserResponseDTO toDTO(User u) {
        return new UserResponseDTO(
                u.getId(), u.getFullName(), u.getEmail(),
                u.getRole(), u.getPincode(), u.getPhone(), u.getCreatedAt());
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
