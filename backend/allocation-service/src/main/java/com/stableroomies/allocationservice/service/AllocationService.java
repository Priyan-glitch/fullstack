package com.stableroomies.allocationservice.service;

import com.stableroomies.allocationservice.dto.AllocationResponseDTO;
import com.stableroomies.allocationservice.dto.AllocationResponseDTO.RoomInfoDTO;
import com.stableroomies.allocationservice.model.Roommate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Template service for allocation
 * This will integrate with algorithm-engine later
 */
@Service
public class AllocationService {

    /**
     * Get allocation status for a student
     * TODO: Replace with actual database queries and algorithm-engine integration
     */
    public AllocationResponseDTO getAllocationByStudentId(Long studentId) {
        // For now, return default "not_started" status
        // In the future, this will check database for actual allocation
        
        // Example: Return pending status if student has submitted preferences
        // This is a placeholder - you'll integrate with preferences service
        return AllocationResponseDTO.notStarted(studentId);
    }

    /**
     * Trigger allocation process
     * TODO: This will call algorithm-engine to compute allocations
     */
    public String triggerAllocation() {
        // Placeholder for algorithm-engine integration
        return "Allocation process triggered. This will be connected to algorithm-engine.";
    }

    /**
     * Get roommates for a student
     * TODO: Replace with actual database queries
     */
    public List<Roommate> getRoommatesByStudentId(Long studentId) {
        // Placeholder - return empty list
        // In the future, query from allocations and fetch student details
        return new ArrayList<>();
    }

    /**
     * Example method showing how allocated response would look
     * This demonstrates the expected structure when allocation is complete
     */
    public AllocationResponseDTO createSampleAllocatedResponse(Long studentId) {
        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setStudentId(studentId);
        response.setAllocationStatus("allocated");
        response.setMessage("Room has been allocated successfully!");
        response.setAllocatedAt(LocalDateTime.now());

        // Sample room info
        RoomInfoDTO room = new RoomInfoDTO(
            101L,           // roomId
            "A-201",        // roomNumber
            "Boys Hostel A", // hostelName
            "A",            // block
            2,              // floor
            "2-Sharing",    // roomType
            2               // capacity
        );
        response.setRoom(room);

        // Sample roommates
        List<Roommate> roommates = new ArrayList<>();
        roommates.add(new Roommate(
            studentId + 1,
            "John Doe",
            "21BCE1001",
            "Computer Science",
            2
        ));
        response.setRoommates(roommates);

        return response;
    }
}
