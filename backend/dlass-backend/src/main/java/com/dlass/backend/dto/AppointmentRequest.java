package com.dlass.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRequest {

    private String providerId;
    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;

    public String getProviderId() { return providerId; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }

    public void setProviderId(String providerId) { this.providerId = providerId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}