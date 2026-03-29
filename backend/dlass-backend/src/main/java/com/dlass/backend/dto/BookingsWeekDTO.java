package com.dlass.backend.dto;

public class BookingsWeekDTO {

    private String date;   // e.g. "2026-03-28"
    private long count;

    public BookingsWeekDTO() {}

    public BookingsWeekDTO(String date, long count) {
        this.date = date;
        this.count = count;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
