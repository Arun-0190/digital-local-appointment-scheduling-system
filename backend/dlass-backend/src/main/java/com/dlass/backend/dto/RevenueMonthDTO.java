package com.dlass.backend.dto;

public class RevenueMonthDTO {

    private String month;    // e.g. "2026-03"
    private double revenue;

    public RevenueMonthDTO() {}

    public RevenueMonthDTO(String month, double revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public double getRevenue() { return revenue; }
    public void setRevenue(double revenue) { this.revenue = revenue; }
}
