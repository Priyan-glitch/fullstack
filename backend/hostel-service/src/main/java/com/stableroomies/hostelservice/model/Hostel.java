package com.stableroomies.hostelservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostels")
public class Hostel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Integer totalCapacity;

    @Column(nullable = false)
    private Integer availableCapacity;

    @Column(nullable = false)
    private Integer totalRooms;

    @Column(nullable = false, length = 20)
    private String genderType; // MALE, FEMALE, MIXED

    @Column(columnDefinition = "TEXT")
    private String amenities; // JSON string or comma-separated

    @Column(length = 150)
    private String wardenName;

    @Column(length = 20)
    private String wardenPhone;

    @Column(nullable = false)
    private Boolean active = true;

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
    }

    // Constructors
    public Hostel() {
    }

    public Hostel(String name, String address, Integer totalCapacity, Integer totalRooms, String genderType) {
        this.name = name;
        this.address = address;
        this.totalCapacity = totalCapacity;
        this.availableCapacity = totalCapacity;
        this.totalRooms = totalRooms;
        this.genderType = genderType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public Integer getAvailableCapacity() {
        return availableCapacity;
    }

    public void setAvailableCapacity(Integer availableCapacity) {
        this.availableCapacity = availableCapacity;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public String getGenderType() {
        return genderType;
    }

    public void setGenderType(String genderType) {
        this.genderType = genderType;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getWardenName() {
        return wardenName;
    }

    public void setWardenName(String wardenName) {
        this.wardenName = wardenName;
    }

    public String getWardenPhone() {
        return wardenPhone;
    }

    public void setWardenPhone(String wardenPhone) {
        this.wardenPhone = wardenPhone;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
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
