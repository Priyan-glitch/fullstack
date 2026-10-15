package com.stableroomies.hostelservice.controller;

import com.stableroomies.hostelservice.model.Hostel;
import com.stableroomies.hostelservice.service.HostelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hostels")
@CrossOrigin(origins = "*")
public class HostelController {

    @Autowired
    private HostelService hostelService;

    @GetMapping
    public List<Hostel> getAllHostels() {
        return hostelService.getAllHostels();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hostel> getHostelById(@PathVariable Long id) {
        return hostelService.getHostelById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Hostel> createHostel(@RequestBody Hostel hostel) {
        // 201, to match POST /api/students and POST /api/allocations. This
        // returned a bare 200, which was the only create endpoint not signalling
        // creation. The UI reads response.ok, so it accepts either.
        return ResponseEntity.status(HttpStatus.CREATED).body(hostelService.createHostel(hostel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hostel> updateHostel(@PathVariable Long id, @RequestBody Hostel hostel) {
        return ResponseEntity.ok(hostelService.updateHostel(id, hostel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHostel(@PathVariable Long id) {
        hostelService.deleteHostel(id);
        return ResponseEntity.noContent().build();
    }
}
