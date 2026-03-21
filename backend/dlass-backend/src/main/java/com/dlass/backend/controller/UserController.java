package com.dlass.backend.controller;

import com.dlass.backend.dto.UserResponseDTO;
import com.dlass.backend.model.User;
import com.dlass.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

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
}
