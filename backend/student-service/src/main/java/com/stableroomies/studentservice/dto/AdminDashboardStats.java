package com.stableroomies.studentservice.dto;

public class AdminDashboardStats {
    private Long totalStudents;
    private Long allocatedStudents;
    private Long pendingAllocation;
    private Long activeStudents;
    private Long inactiveStudents;
    private Long twoSharing;
    private Long threeSharing;

    public AdminDashboardStats() {
    }

    public AdminDashboardStats(Long totalStudents, Long allocatedStudents, Long pendingAllocation,
                              Long activeStudents, Long inactiveStudents, Long twoSharing, Long threeSharing) {
        this.totalStudents = totalStudents;
        this.allocatedStudents = allocatedStudents;
        this.pendingAllocation = pendingAllocation;
        this.activeStudents = activeStudents;
        this.inactiveStudents = inactiveStudents;
        this.twoSharing = twoSharing;
        this.threeSharing = threeSharing;
    }

    // Getters and Setters
    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getAllocatedStudents() {
        return allocatedStudents;
    }

    public void setAllocatedStudents(Long allocatedStudents) {
        this.allocatedStudents = allocatedStudents;
    }

    public Long getPendingAllocation() {
        return pendingAllocation;
    }

    public void setPendingAllocation(Long pendingAllocation) {
        this.pendingAllocation = pendingAllocation;
    }

    public Long getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(Long activeStudents) {
        this.activeStudents = activeStudents;
    }

    public Long getInactiveStudents() {
        return inactiveStudents;
    }

    public void setInactiveStudents(Long inactiveStudents) {
        this.inactiveStudents = inactiveStudents;
    }

    public Long getTwoSharing() {
        return twoSharing;
    }

    public void setTwoSharing(Long twoSharing) {
        this.twoSharing = twoSharing;
    }

    public Long getThreeSharing() {
        return threeSharing;
    }

    public void setThreeSharing(Long threeSharing) {
        this.threeSharing = threeSharing;
    }
}
