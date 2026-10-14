package com.stableroomies.allocationservice.dto;

public class AllocationTriggerRequest {
    private String strategy = "graph_clustering";
    private Integer year = 4;
    private String runBy = "admin";
    private String notes;

    public AllocationTriggerRequest() {}

    public AllocationTriggerRequest(String strategy, Integer year, String runBy, String notes) {
        this.strategy = strategy;
        this.year = year;
        this.runBy = runBy;
        this.notes = notes;
    }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getRunBy() { return runBy; }
    public void setRunBy(String runBy) { this.runBy = runBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
