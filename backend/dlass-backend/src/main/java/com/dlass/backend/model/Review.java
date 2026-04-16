package com.dlass.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    private String providerId;
    private String userId;
    private String appointmentId;

    private int rating; // 1 to 5
    private String comment;
    private String reply;

    private LocalDateTime createdAt;

    public Review() {}

    public void setId(String id) { this.id = id; }
    public String getId() { return id; }
    public String getProviderId() { return providerId; }
    public String getUserId() { return userId; }
    public String getAppointmentId() { return appointmentId; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public String getReply() { return reply; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setProviderId(String providerId) { this.providerId = providerId; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }
    public void setRating(int rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setReply(String reply) { this.reply = reply; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @org.springframework.data.annotation.Transient
    private String userName;

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

}