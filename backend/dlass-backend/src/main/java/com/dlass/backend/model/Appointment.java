package com.dlass.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "appointments")
@CompoundIndex(name = "unique_slot",
        def = "{'providerId': 1, 'date': 1, 'startTime': 1}",
        unique = true)
public class Appointment {

    @Id
    private String id;

    private String providerId;
    private String userId;

    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;

    private String status;

    public Appointment() {}

    public Appointment(String providerId, String userId, LocalDate date,
                       LocalTime startTime, LocalTime endTime, String status) {
        this.providerId = providerId;
        this.userId = userId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public String getId() { return id; }
    public String getProviderId() { return providerId; }
    public String getUserId() { return userId; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getStatus() { return status; }

    public void setProviderId(String providerId) { this.providerId = providerId; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(String status) { this.status = status; }
}