package com.stableroomies.hostelservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores admin-controlled availability for each room-type/AC-type combination.
 * One row per (roomType, acType) pair. Admin can toggle each on/off and set
 * the current available-room count.
 *
 * roomType  : INDIVIDUAL | 2_SHARING | 3_SHARING | 4_SHARING
 * acType    : AC | NON_AC
 */
@Entity
@Table(
    name = "room_type_config",
    uniqueConstraints = @UniqueConstraint(columnNames = {"room_type", "ac_type"})
)
public class RoomTypeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** One of: INDIVIDUAL, 2_SHARING, 3_SHARING, 4_SHARING */
    @Column(name = "room_type", nullable = false, length = 20)
    private String roomType;

    /** One of: AC, NON_AC */
    @Column(name = "ac_type", nullable = false, length = 10)
    private String acType;

    /** Whether this combination is currently open for students to select */
    @Column(nullable = false)
    private Boolean available = false;

    /** Total rooms of this type present in the hostel inventory */
    @Column(nullable = false)
    private Integer totalRooms = 0;

    /** How many rooms of this type still have vacant beds */
    @Column(nullable = false)
    private Integer availableRooms = 0;

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

    // ─── Constructors ────────────────────────────────────────────────────────

    public RoomTypeConfig() {}

    public RoomTypeConfig(String roomType, String acType) {
        this.roomType = roomType;
        this.acType = acType;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getAcType() { return acType; }
    public void setAcType(String acType) { this.acType = acType; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
