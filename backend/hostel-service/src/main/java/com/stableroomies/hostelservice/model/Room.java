package com.stableroomies.hostelservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long hostelId;

    @Column(nullable = false, length = 20)
    private String roomNumber;

    @Column(nullable = false)
    private Integer floor;

    @Column(length = 10)
    private String block;

    @Column(nullable = false, length = 20)
    private String roomType; // 2-SHARING, 3-SHARING

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer occupiedCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, FULL, MAINTENANCE

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateStatus();
    }

    private void updateStatus() {
        if ("MAINTENANCE".equalsIgnoreCase(status)) {
            return;
        }
        if (occupiedCount != null && capacity != null && occupiedCount >= capacity) {
            status = "FULL";
        } else if (occupiedCount != null && occupiedCount > 0) {
            status = "OCCUPIED";
        } else {
            status = "AVAILABLE";
        }
    }

    // Constructors
    public Room() {
    }

    public Room(Long hostelId, String roomNumber, Integer floor, String block, String roomType, Integer capacity) {
        this.hostelId = hostelId;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.block = block;
        this.roomType = roomType;
        this.capacity = capacity;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHostelId() {
        return hostelId;
    }

    public void setHostelId(Long hostelId) {
        this.hostelId = hostelId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getOccupiedCount() {
        return occupiedCount;
    }

    public void setOccupiedCount(Integer occupiedCount) {
        this.occupiedCount = occupiedCount;
        updateStatus();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
