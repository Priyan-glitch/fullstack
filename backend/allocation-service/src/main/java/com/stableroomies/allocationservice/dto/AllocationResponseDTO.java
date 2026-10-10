package com.stableroomies.allocationservice.dto;

import com.stableroomies.allocationservice.model.Roommate;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for allocation information
 */
public class AllocationResponseDTO {
    
    private Long studentId;
    private String allocationStatus; // "not_started", "pending", "processing", "allocated", "failed"
    private RoomInfoDTO room;
    private List<Roommate> roommates;
    private String message;
    private LocalDateTime allocatedAt;

    // Constructors
    public AllocationResponseDTO() {
    }

    // Static factory methods for different states
    public static AllocationResponseDTO notStarted(Long studentId) {
        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setStudentId(studentId);
        response.setAllocationStatus("not_started");
        response.setMessage("Room allocation has not been initiated yet.");
        return response;
    }

    public static AllocationResponseDTO pending(Long studentId) {
        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setStudentId(studentId);
        response.setAllocationStatus("pending");
        response.setMessage("Your preferences have been submitted. Waiting for admin to publish allocations.");
        return response;
    }

    public static AllocationResponseDTO processing(Long studentId) {
        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setStudentId(studentId);
        response.setAllocationStatus("processing");
        response.setMessage("Your room allocation is being processed.");
        return response;
    }

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getAllocationStatus() {
        return allocationStatus;
    }

    public void setAllocationStatus(String allocationStatus) {
        this.allocationStatus = allocationStatus;
    }

    public RoomInfoDTO getRoom() {
        return room;
    }

    public void setRoom(RoomInfoDTO room) {
        this.room = room;
    }

    public List<Roommate> getRoommates() {
        return roommates;
    }

    public void setRoommates(List<Roommate> roommates) {
        this.roommates = roommates;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getAllocatedAt() {
        return allocatedAt;
    }

    public void setAllocatedAt(LocalDateTime allocatedAt) {
        this.allocatedAt = allocatedAt;
    }

    // Nested class for room information
    public static class RoomInfoDTO {
        private Long roomId;
        private String roomNumber;
        private String hostelName;
        private String block;
        private Integer floor;
        private String roomType;
        private Integer capacity;

        public RoomInfoDTO() {
        }

        public RoomInfoDTO(Long roomId, String roomNumber, String hostelName, String block, 
                          Integer floor, String roomType, Integer capacity) {
            this.roomId = roomId;
            this.roomNumber = roomNumber;
            this.hostelName = hostelName;
            this.block = block;
            this.floor = floor;
            this.roomType = roomType;
            this.capacity = capacity;
        }

        // Getters and Setters
        public Long getRoomId() {
            return roomId;
        }

        public void setRoomId(Long roomId) {
            this.roomId = roomId;
        }

        public String getRoomNumber() {
            return roomNumber;
        }

        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }

        public String getHostelName() {
            return hostelName;
        }

        public void setHostelName(String hostelName) {
            this.hostelName = hostelName;
        }

        public String getBlock() {
            return block;
        }

        public void setBlock(String block) {
            this.block = block;
        }

        public Integer getFloor() {
            return floor;
        }

        public void setFloor(Integer floor) {
            this.floor = floor;
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
    }
}
