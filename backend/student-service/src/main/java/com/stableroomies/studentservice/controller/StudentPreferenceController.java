package com.stableroomies.studentservice.controller;

import com.stableroomies.studentservice.dto.StudentPreferenceDTO;
import com.stableroomies.studentservice.service.StudentPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public ResponseEntity<?> createPreferences(@RequestBody StudentPreferenceDTO dto) {
        try {
            StudentPreferenceDTO created = preferenceService.createPreferences(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update preferences
    @PutMapping("/student/{studentId}")
    public ResponseEntity<?> updatePreferences(
            @PathVariable Long studentId,
            @RequestBody StudentPreferenceDTO dto) {
        try {
            StudentPreferenceDTO updated = preferenceService.updatePreferences(studentId, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Save or update preferences (upsert)
    @PostMapping("/student/{studentId}")
    public ResponseEntity<?> saveOrUpdatePreferences(
            @PathVariable Long studentId,
            @RequestBody StudentPreferenceDTO dto) {
        try {
            dto.setStudentId(studentId); // Ensure student ID matches path
            StudentPreferenceDTO result = preferenceService.saveOrUpdatePreferences(dto);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    // Get all submitted preferences — used by algorithm-engine
    @GetMapping("/submitted")
    public ResponseEntity<List<StudentPreferenceDTO>> getAllSubmittedPreferences() {
        return ResponseEntity.ok(preferenceService.getAllSubmittedPreferences());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
