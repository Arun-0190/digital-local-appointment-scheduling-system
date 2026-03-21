package com.dlass.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    private String userId;
    private String providerId;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String status;    //BOOKED, PAID, CANCELLED, COMPLETED

    private String serviceId;
    private String serviceName;
    private String paymentId;
    private double amount;

    private LocalDateTime createdAt;

    private boolean reminder24Sent = false;
    private boolean reminder1hSent = false;
    private boolean reminderStartSent = false;

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

    public LocalDate getDate() {
        return date;
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

    public void setDate(LocalDate date) {
        this.date = date;
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
}