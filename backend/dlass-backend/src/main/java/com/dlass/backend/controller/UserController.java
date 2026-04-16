package com.dlass.backend.controller;

import com.dlass.backend.dto.ProfileUpdateRequest;
import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.model.User;
import com.dlass.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.frontend-url}")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponseDTO registerUser(@RequestBody User user) {
        user.setRole("USER");
        return userService.registerUser(user);
    }

    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    /** Returns the currently authenticated user's profile. */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getMe(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getMe(email));
    }

    /** Delete a user by ID (admin use). */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }

    // ── Feature 4: Profile Management ────────────────────────────────────────

    /** Update the authenticated user's own profile (name, phone, email). */
    @PutMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    /** Deactivate own account (sets isActive = false). */
    @PatchMapping("/deactivate")
    public ResponseEntity<String> deactivateSelf(Authentication authentication) {
        userService.deactivateSelf(authentication.getName());
        return ResponseEntity.ok("Account deactivated successfully");
    }

    /** Soft-delete own account (sets isDeleted = true, isActive = false). */
    @PatchMapping("/delete")
    public ResponseEntity<String> softDeleteSelf(Authentication authentication) {
        userService.softDeleteSelf(authentication.getName());
        return ResponseEntity.ok("Account deleted successfully");
    }

    // ── Feature 5: Avatar Upload ──────────────────────────────────────────────

    /** Upload a profile picture. Returns updated user DTO with profileImageUrl. */
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            UserResponseDTO updated = userService.uploadAvatar(authentication.getName(), file);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save avatar."));
        }
    }
}
