package com.stableroomies.studentservice.service;

import com.stableroomies.studentservice.dto.StudentPreferenceDTO;
import com.stableroomies.studentservice.model.StudentPreference;
import com.stableroomies.studentservice.repository.StudentPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.stableroomies.studentservice.model.Student;
import com.stableroomies.studentservice.repository.StudentRepository;
import java.util.Optional;

@Service
public class StudentPreferenceService {

    @Autowired
    private StudentPreferenceRepository preferenceRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Get preferences by student ID
    public StudentPreferenceDTO getPreferencesByStudentId(Long studentId) {
        Optional<StudentPreference> preference = preferenceRepository.findByStudentId(studentId);
        return preference.map(this::convertToDTO).orElse(null);
    }

    // Validate that preferred roommates match the student's gender (separate boys and girls hostels)
    private void validatePreferredRoommatesGender(Long studentId, String preferredRoommateIds) {
        if (preferredRoommateIds == null || preferredRoommateIds.trim().isEmpty() || studentId == null) {
            return;
        }

        Student currentStudent = studentRepository.findById(studentId).orElse(null);
        if (currentStudent == null || currentStudent.getGender() == null) {
            return;
        }

        String studentGender = currentStudent.getGender().trim();
        String[] ids = preferredRoommateIds.split(",");
        for (String idStr : ids) {
            String trimmed = idStr.trim();
            if (!trimmed.isEmpty()) {
                try {
                    Long rId = Long.parseLong(trimmed);
                    Student roommate = studentRepository.findById(rId).orElse(null);
                    if (roommate != null && roommate.getGender() != null) {
                        if (!studentGender.equalsIgnoreCase(roommate.getGender().trim())) {
                            throw new IllegalArgumentException(
                                "Gender constraint violation: A " + studentGender.toLowerCase() + 
                                " student cannot select a " + roommate.getGender().toLowerCase() + 
                                " student (" + roommate.getFirstName() + " " + roommate.getLastName() + ") as a roommate. " +
                                "Boys and girls hostels are separate."
                            );
                        }
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
    }

    // Create new preferences
    public StudentPreferenceDTO createPreferences(StudentPreferenceDTO dto) {
        if (preferenceRepository.existsByStudentId(dto.getStudentId())) {
            throw new RuntimeException("Preferences already exist for student ID: " + dto.getStudentId());
        }

        validatePreferredRoommatesGender(dto.getStudentId(), dto.getPreferredRoommateIds());

        StudentPreference preference = convertToEntity(dto);
        preference.setCreatedAt(LocalDateTime.now());
        StudentPreference saved = preferenceRepository.save(preference);
        return convertToDTO(saved);
    }

    // Update existing preferences
    public StudentPreferenceDTO updatePreferences(Long studentId, StudentPreferenceDTO dto) {
        StudentPreference preference = preferenceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Preferences not found for student ID: " + studentId));

        if (Boolean.TRUE.equals(preference.getSubmitted())) {
            throw new IllegalStateException("Preferences have already been submitted and cannot be modified.");
        }

        validatePreferredRoommatesGender(studentId, dto.getPreferredRoommateIds());

        // Update fields
        preference.setRoomType(dto.getRoomType());
        preference.setAcPreference(dto.getAcPreference());
        preference.setSleepTime(dto.getSleepTime());
        preference.setWakeUpTime(dto.getWakeUpTime());
        preference.setStudyTiming(dto.getStudyTiming());
        preference.setNoisePreference(dto.getNoisePreference());
        preference.setCleanlinessLevel(dto.getCleanlinessLevel());
        preference.setStudyPreference(dto.getStudyPreference());
        preference.setStudyFrequency(dto.getStudyFrequency());
        preference.setStudyEnvironment(dto.getStudyEnvironment());
        preference.setSocialPreference(dto.getSocialPreference());
        preference.setPersonalSpace(dto.getPersonalSpace());
        preference.setVisitorPreference(dto.getVisitorPreference());
        preference.setPreferredRoommateIds(dto.getPreferredRoommateIds());
        preference.setSubmitted(dto.getSubmitted());
        preference.setUpdatedAt(LocalDateTime.now());

        StudentPreference updated = preferenceRepository.save(preference);
        return convertToDTO(updated);
    }

    // Save or update preferences (upsert)
    public StudentPreferenceDTO saveOrUpdatePreferences(StudentPreferenceDTO dto) {
        Optional<StudentPreference> existing = preferenceRepository.findByStudentId(dto.getStudentId());
        
        if (existing.isPresent()) {
            if (Boolean.TRUE.equals(existing.get().getSubmitted())) {
                throw new IllegalStateException("Preferences have already been submitted and cannot be modified.");
            }
            return updatePreferences(dto.getStudentId(), dto);
        } else {
            return createPreferences(dto);
        }
    }

    // Delete preferences
    public void deletePreferences(Long studentId) {
        StudentPreference preference = preferenceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Preferences not found for student ID: " + studentId));
        preferenceRepository.delete(preference);
    }

    // Check if preferences exist
    public boolean hasPreferences(Long studentId) {
        return preferenceRepository.existsByStudentId(studentId);
    }

    // Get all submitted preferences (used by algorithm-engine)
    public List<StudentPreferenceDTO> getAllSubmittedPreferences() {
        return preferenceRepository.findBySubmitted(true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper methods for conversion
    public StudentPreferenceDTO convertToDTO(StudentPreference entity) {
        StudentPreferenceDTO dto = new StudentPreferenceDTO();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setRoomType(entity.getRoomType());
        dto.setAcPreference(entity.getAcPreference());
        dto.setSleepTime(entity.getSleepTime());
        dto.setWakeUpTime(entity.getWakeUpTime());
        dto.setStudyTiming(entity.getStudyTiming());
        dto.setNoisePreference(entity.getNoisePreference());
        dto.setCleanlinessLevel(entity.getCleanlinessLevel());
        dto.setStudyPreference(entity.getStudyPreference());
        dto.setStudyFrequency(entity.getStudyFrequency());
        dto.setStudyEnvironment(entity.getStudyEnvironment());
        dto.setSocialPreference(entity.getSocialPreference());
        dto.setPersonalSpace(entity.getPersonalSpace());
        dto.setVisitorPreference(entity.getVisitorPreference());
        dto.setPreferredRoommateIds(entity.getPreferredRoommateIds());
        dto.setSubmitted(entity.getSubmitted());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private StudentPreference convertToEntity(StudentPreferenceDTO dto) {
        StudentPreference entity = new StudentPreference();
        entity.setStudentId(dto.getStudentId());
        entity.setRoomType(dto.getRoomType());
        entity.setAcPreference(dto.getAcPreference());
        entity.setSleepTime(dto.getSleepTime());
        entity.setWakeUpTime(dto.getWakeUpTime());
        entity.setStudyTiming(dto.getStudyTiming());
        entity.setNoisePreference(dto.getNoisePreference());
        entity.setCleanlinessLevel(dto.getCleanlinessLevel());
        entity.setStudyPreference(dto.getStudyPreference());
        entity.setStudyFrequency(dto.getStudyFrequency());
        entity.setStudyEnvironment(dto.getStudyEnvironment());
        entity.setSocialPreference(dto.getSocialPreference());
        entity.setPersonalSpace(dto.getPersonalSpace());
        entity.setVisitorPreference(dto.getVisitorPreference());
        entity.setPreferredRoommateIds(dto.getPreferredRoommateIds());
        entity.setSubmitted(dto.getSubmitted());
        return entity;
    }
}

