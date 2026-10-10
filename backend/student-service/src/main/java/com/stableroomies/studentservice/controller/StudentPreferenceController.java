package com.stableroomies.studentservice.controller;

import com.stableroomies.studentservice.dto.StudentPreferenceDTO;
import com.stableroomies.studentservice.service.StudentPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "*")
public class StudentPreferenceController {

    @Autowired
    private StudentPreferenceService preferenceService;

    // Get preferences by student ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentPreferenceDTO> getPreferencesByStudentId(@PathVariable Long studentId) {
        StudentPreferenceDTO preferences = preferenceService.getPreferencesByStudentId(studentId);
        if (preferences == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(preferences);
    }

    // Create new preferences
    @PostMapping
    public ResponseEntity<StudentPreferenceDTO> createPreferences(@RequestBody StudentPreferenceDTO dto) {
        try {
            StudentPreferenceDTO created = preferenceService.createPreferences(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update preferences
    @PutMapping("/student/{studentId}")
    public ResponseEntity<StudentPreferenceDTO> updatePreferences(
            @PathVariable Long studentId,
            @RequestBody StudentPreferenceDTO dto) {
        try {
            StudentPreferenceDTO updated = preferenceService.updatePreferences(studentId, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Save or update preferences (upsert)
    @PostMapping("/student/{studentId}")
    public ResponseEntity<StudentPreferenceDTO> saveOrUpdatePreferences(
            @PathVariable Long studentId,
            @RequestBody StudentPreferenceDTO dto) {
        dto.setStudentId(studentId); // Ensure student ID matches path
        StudentPreferenceDTO result = preferenceService.saveOrUpdatePreferences(dto);
        return ResponseEntity.ok(result);
    }

    // Delete preferences
    @DeleteMapping("/student/{studentId}")
    public ResponseEntity<Void> deletePreferences(@PathVariable Long studentId) {
        try {
            preferenceService.deletePreferences(studentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Check if preferences exist
    @GetMapping("/student/{studentId}/exists")
    public ResponseEntity<Boolean> hasPreferences(@PathVariable Long studentId) {
        boolean exists = preferenceService.hasPreferences(studentId);
        return ResponseEntity.ok(exists);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
