package com.dlass.backend.dto;

import java.time.LocalDateTime;

public class UserResponseDTO {

    private String id;
    private String fullName;
    private String email;
    private String role;
    private String pincode;
    private String phone;
    private LocalDateTime createdAt;

    public UserResponseDTO(String id, String fullName, String email,
                           String role, String pincode,
                           LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.pincode = pincode;
        this.createdAt = createdAt;
    }

    public UserResponseDTO(String id, String fullName, String email,
                           String role, String pincode, String phone,
                           LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.pincode = pincode;
        this.phone = phone;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getPincode() { return pincode; }
    public String getPhone() { return phone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
