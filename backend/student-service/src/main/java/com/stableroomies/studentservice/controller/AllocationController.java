package com.stableroomies.studentservice.controller;

import com.stableroomies.studentservice.model.Student;
import com.stableroomies.studentservice.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/allocations")
@CrossOrigin(origins = "*")
public class AllocationController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getAllocationByStudent(@PathVariable Long studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student student = studentOpt.get();
        Map<String, Object> response = new HashMap<>();

        if (student.getRoomNumber() == null || student.getRoomNumber().trim().isEmpty()) {
            response.put("allocationStatus", "pending");
            response.put("room", null);
            response.put("roommates", Collections.emptyList());
            return ResponseEntity.ok(response);
        }

        response.put("allocationStatus", "allocated");

        Map<String, Object> room = new HashMap<>();
        room.put("roomNumber", student.getRoomNumber());
        room.put("hostelName", student.getHostelBlock() != null ? student.getHostelBlock() : "Main Hostel");
        room.put("block", student.getHostelBlock() != null ? student.getHostelBlock() : "A Block");
        room.put("floor", "1st Floor");
        room.put("roomType", "2-Sharing");
        response.put("room", room);

        List<Student> roommatesList = studentRepository.findByRoomNumber(student.getRoomNumber());
        List<Map<String, Object>> roommates = roommatesList.stream()
                .filter(s -> !s.getId().equals(studentId))
                .map(r -> {
                    Map<String, Object> rm = new HashMap<>();
                    rm.put("id", r.getId());
                    rm.put("name", r.getFirstName() + " " + r.getLastName());
                    rm.put("department", r.getDepartment() != null ? r.getDepartment().getDisplayName() : "Engineering");
                    rm.put("year", r.getYear());
                    rm.put("email", r.getEmail());
                    return rm;
                })
                .collect(Collectors.toList());

        response.put("roommates", roommates);
        return ResponseEntity.ok(response);
    }
}
