package com.stableroomies.hostelservice.controller;

import com.stableroomies.hostelservice.dto.HostelDashboardStats;
import com.stableroomies.hostelservice.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/stats")
    public ResponseEntity<HostelDashboardStats> getDashboardStats() {
        return ResponseEntity.ok(roomService.getDashboardStats());
    }
}
