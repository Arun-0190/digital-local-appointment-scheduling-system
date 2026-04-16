package com.dlass.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    private String userId;
    private String providerId;

    /**
     * Managed as LocalDateTime to handle ISO strings (e.g. 2026-04-02T03:30:00.000Z) from MongoDB.
     * We hide this from outgoing JSON to prevent breaking frontend date parsing.
     */
    @Field("date")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private LocalDateTime dateTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;


    private String status;    //BOOKED, PAID, CANCELLED, COMPLETED

    private String serviceId;
    private String serviceName;
    private String paymentId;
    private double amount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;


    private boolean reminder24Sent = false;
    private boolean reminder1hSent = false;
    private boolean reminderStartSent = false;

    private boolean isDeleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private String deactivationReason;

    public Appointment() {}

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getProviderId() {
        return providerId;
    }

    /**
     * This is the primary date field used by the frontend.
     * Annotated to ensure outgoing JSON remains yyyy-MM-dd compatible.
     */
    @JsonProperty("date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate getDate() {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }

    @JsonProperty("date")
    public void setDate(LocalDate date) {
        this.dateTime = (date != null) ? date.atStartOfDay() : null;
    }

    // Helper for backend logic requiring full precision (if any)
    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getStatus() {
        return status;
    }

    public String getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }

    public String getPaymentId() {
        return paymentId;
    }

    public double getAmount() {
        return amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isReminder24Sent() {
        return reminder24Sent;
    }

    public void setReminder24Sent(boolean reminder24Sent) {
        this.reminder24Sent = reminder24Sent;
    }

    public boolean isReminder1hSent() {
        return reminder1hSent;
    }

    public void setReminder1hSent(boolean reminder1hSent) {
        this.reminder1hSent = reminder1hSent;
    }

    public boolean isReminderStartSent() {
        return reminderStartSent;
    }

    public void setReminderStartSent(boolean reminderStartSent) {
        this.reminderStartSent = reminderStartSent;
    }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) { this.deletedBy = deletedBy; }

    public String getDeactivationReason() { return deactivationReason; }
    public void setDeactivationReason(String deactivationReason) { this.deactivationReason = deactivationReason; }
}