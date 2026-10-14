package com.stableroomies.allocationservice.dto;

import java.time.LocalDateTime;

public class AllocationTriggerResponse {
    private String jobId;
    private String status;
    private String message;
    private String strategy;
    private Integer year;
    private String runBy;
    private LocalDateTime timestamp;

    public AllocationTriggerResponse() {}

    public AllocationTriggerResponse(String jobId, String status, String message, String strategy, Integer year, String runBy) {
        this.jobId = jobId;
        this.status = status;
        this.message = message;
        this.strategy = strategy;
        this.year = year;
        this.runBy = runBy;
        this.timestamp = LocalDateTime.now();
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getRunBy() { return runBy; }
    public void setRunBy(String runBy) { this.runBy = runBy; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
