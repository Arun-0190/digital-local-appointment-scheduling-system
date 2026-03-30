package com.dlass.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "slot_locks")
public class SlotLock {

    @Id
    private String id;
    private String providerId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalDateTime lockedAt;
    private LocalDateTime expiresAt;
    private String userId;

    public SlotLock() {}

    public SlotLock(String providerId, LocalDate date, LocalTime startTime, LocalDateTime lockedAt, LocalDateTime expiresAt, String userId) {
        this.providerId = providerId;
        this.date = date;
        this.startTime = startTime;
        this.lockedAt = lockedAt;
        this.expiresAt = expiresAt;
        this.userId = userId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
