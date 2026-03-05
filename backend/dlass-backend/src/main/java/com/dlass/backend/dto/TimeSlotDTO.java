package com.dlass.backend.dto;

import java.time.LocalTime;

public class TimeSlotDTO {

    private LocalTime startTime;
    private LocalTime endTime;

    public TimeSlotDTO(LocalTime startTime, LocalTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }
}