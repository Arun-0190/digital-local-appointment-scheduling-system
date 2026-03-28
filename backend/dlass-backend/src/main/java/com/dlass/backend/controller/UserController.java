package com.dlass.backend.controller;

import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.model.User;
import com.dlass.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
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

    /** Returns the currently authenticated user's profile (pincode, name, role). */
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
}
