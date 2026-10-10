package com.stableroomies.hostelservice.dto;

public class HostelDashboardStats {
    private Long totalRooms;
    private Long availableRooms;
    private Long occupiedRooms;
    private Long twoSharing;
    private Long threeSharing;
    private Long fourSharing;

    public HostelDashboardStats() {
    }

    public HostelDashboardStats(Long totalRooms, Long availableRooms, Long occupiedRooms,
                               Long twoSharing, Long threeSharing, Long fourSharing) {
        this.totalRooms = totalRooms;
        this.availableRooms = availableRooms;
        this.occupiedRooms = occupiedRooms;
        this.twoSharing = twoSharing;
        this.threeSharing = threeSharing;
        this.fourSharing = fourSharing;
    }

    // Getters and Setters
    public Long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public Long getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Long availableRooms) {
        this.availableRooms = availableRooms;
    }

    public Long getOccupiedRooms() {
        return occupiedRooms;
    }

    public void setOccupiedRooms(Long occupiedRooms) {
        this.occupiedRooms = occupiedRooms;
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

    public Long getFourSharing() {
        return fourSharing;
    }

    public void setFourSharing(Long fourSharing) {
        this.fourSharing = fourSharing;
    }
}
