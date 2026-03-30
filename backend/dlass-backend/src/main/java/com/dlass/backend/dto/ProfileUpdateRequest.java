package com.dlass.backend.dto;

/**
 * Request body for PUT /api/users/profile and PUT /api/providers/profile.
 * All fields are optional — only non-null values are applied.
 */
public class ProfileUpdateRequest {

    private String name;
    private String phone;
    private String email;

    // Provider-specific fields (ignored for user updates)
    private String city;
    private String area;
    private String pincode;

    public ProfileUpdateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
