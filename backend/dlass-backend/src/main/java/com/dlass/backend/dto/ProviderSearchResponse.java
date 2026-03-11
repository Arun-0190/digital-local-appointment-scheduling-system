package com.dlass.backend.dto;

public class ProviderSearchResponse {

    private String id;
    private String businessName;
    private String area;
    private String city;
    private String pincode;
    private int experienceYears;
    private double rating;
    private int reviewCount;

    public ProviderSearchResponse() {}

    public ProviderSearchResponse(String id, String businessName, String area,
                                  String city, String pincode,
                                  int experienceYears, double rating, int reviewCount) {
        this.id = id;
        this.businessName = businessName;
        this.area = area;
        this.city = city;
        this.pincode = pincode;
        this.experienceYears = experienceYears;
        this.rating = rating;
        this.reviewCount = reviewCount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

}