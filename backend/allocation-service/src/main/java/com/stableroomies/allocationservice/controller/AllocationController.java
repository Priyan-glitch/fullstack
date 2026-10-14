package com.stableroomies.allocationservice.controller;

import com.stableroomies.allocationservice.dto.AllocationResponseDTO;
import com.stableroomies.allocationservice.dto.AllocationTriggerRequest;
import com.stableroomies.allocationservice.dto.AllocationTriggerResponse;
import com.stableroomies.allocationservice.model.Roommate;
import com.stableroomies.allocationservice.service.AllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocation")
@CrossOrigin(origins = "*")
public class AllocationController {

    @Autowired
    private AllocationService allocationService;

    /**
     * Admin endpoint: Trigger asynchronous allocation process via RabbitMQ
     */
    @PostMapping("/trigger")
    public ResponseEntity<AllocationTriggerResponse> triggerAllocation(
            @RequestBody(required = false) AllocationTriggerRequest request) {
        if (request == null) {
            request = new AllocationTriggerRequest();
        }
        AllocationTriggerResponse response = allocationService.triggerAllocationAsync(request);
        return ResponseEntity.accepted().body(response);
    }

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
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Allocation Service is running with RabbitMQ async producer integration");
    }

    /**
     * Sample endpoint showing how allocated response would look
     */
    @GetMapping("/student/{studentId}/sample")
    public ResponseEntity<AllocationResponseDTO> getSampleAllocation(@PathVariable Long studentId) {
        AllocationResponseDTO sample = allocationService.createSampleAllocatedResponse(studentId);
        return ResponseEntity.ok(sample);
    }
}
