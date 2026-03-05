package com.dlass.backend.controller;

import com.dlass.backend.dto.LoginRequest;
import com.dlass.backend.dto.LoginResponse;
import com.dlass.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );
    }

    @GetMapping("/test")
    public String test() {
        return "AUTH WORKING";
    }
}