package com.stableroomies.hostelservice.controller;

import com.stableroomies.hostelservice.dto.HostelDashboardStats;
import com.stableroomies.hostelservice.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
// No @CrossOrigin here on purpose: the gateway is the single CORS authority for
// /api/*. A second Access-Control-Allow-Origin from this service makes the
// response carry two values, which browsers reject outright.
public class DashboardController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/stats")
    public ResponseEntity<HostelDashboardStats> getDashboardStats() {
        return ResponseEntity.ok(roomService.getDashboardStats());
    }
}
