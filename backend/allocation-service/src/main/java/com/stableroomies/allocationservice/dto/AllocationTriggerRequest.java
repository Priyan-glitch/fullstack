package com.stableroomies.allocationservice.dto;

public class AllocationTriggerRequest {
    private String strategy = "graph_clustering";

    /**
     * Academic year to allocate, or null for every year.
     *
     * This used to default to 4, which silently restricted allocation to year-4
     * students. The admin UI's "All years" option sends an explicit null, and
     * that null was then coerced to 4 here, so the option never did what it said.
     */
    private Integer year;

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
