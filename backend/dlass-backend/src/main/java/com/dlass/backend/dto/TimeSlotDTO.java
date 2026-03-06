package com.dlass.backend.dto;

import java.time.LocalTime;

public class TimeSlotDTO {

    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

    public TimeSlotDTO(LocalTime startTime, LocalTime endTime, boolean available) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public boolean isAvailable(){
        return available;
    }
}