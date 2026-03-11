package com.dlass.backend.dto;

public class ServiceDTO {

    private String id;
    private String name;
    private int duration;
    private double price;

    public ServiceDTO(String id, String name, int duration, double price) {
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getDuration() {
        return duration;
    }

    public double getPrice() {
        return price;
    }
}