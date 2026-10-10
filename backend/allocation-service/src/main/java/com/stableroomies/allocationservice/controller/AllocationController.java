package com.stableroomies.allocationservice.controller;

import com.stableroomies.allocationservice.dto.AllocationResponseDTO;
import com.stableroomies.allocationservice.model.Roommate;
import com.stableroomies.allocationservice.service.AllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Template controller for allocation endpoints
 * Will be connected to algorithm-engine later
 */
@RestController
@RequestMapping("/api/allocations")
@CrossOrigin(origins = "*")
public class AllocationController {

    @Autowired
    private AllocationService allocationService;

    /**
     * Get allocation status and details for a student
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<AllocationResponseDTO> getAllocationByStudentId(@PathVariable Long studentId) {
        AllocationResponseDTO allocation = allocationService.getAllocationByStudentId(studentId);
        return ResponseEntity.ok(allocation);
    }

    /**
     * Get roommates for a student
     */
    @GetMapping("/student/{studentId}/roommates")
    public ResponseEntity<List<Roommate>> getRoommatesByStudentId(@PathVariable Long studentId) {
        List<Roommate> roommates = allocationService.getRoommatesByStudentId(studentId);
        return ResponseEntity.ok(roommates);
    }

    /**
     * Admin endpoint: Trigger allocation process
     * TODO: This will integrate with algorithm-engine
     */
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerAllocation() {
        String result = allocationService.triggerAllocation();
        return ResponseEntity.ok(result);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Allocation Service is running (Template mode - algorithm-engine not yet integrated)");
    }

    /**
     * Sample endpoint showing how allocated response would look
     * For testing frontend integration
     */
    @GetMapping("/student/{studentId}/sample")
    public ResponseEntity<AllocationResponseDTO> getSampleAllocation(@PathVariable Long studentId) {
        AllocationResponseDTO sample = allocationService.createSampleAllocatedResponse(studentId);
        return ResponseEntity.ok(sample);
    }
}
