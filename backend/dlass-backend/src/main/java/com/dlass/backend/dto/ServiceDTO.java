package com.dlass.backend.dto;

public class ServiceDTO {

    private String id;
    private String name;
    private int durationMinutes;
    private double price;

    public ServiceDTO(String id, String name, int durationMinutes, double price) {
        this.id = id;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public double getPrice() {
        return price;
    }
}