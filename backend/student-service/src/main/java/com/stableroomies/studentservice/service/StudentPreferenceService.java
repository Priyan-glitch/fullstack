package com.stableroomies.studentservice.service;

import com.stableroomies.studentservice.dto.StudentPreferenceDTO;
import com.stableroomies.studentservice.model.StudentPreference;
import com.stableroomies.studentservice.repository.StudentPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StudentPreferenceService {

    @Autowired
    private StudentPreferenceRepository preferenceRepository;

    // Get preferences by student ID
    public StudentPreferenceDTO getPreferencesByStudentId(Long studentId) {
        Optional<StudentPreference> preference = preferenceRepository.findByStudentId(studentId);
        return preference.map(this::convertToDTO).orElse(null);
    }

    // Create new preferences
    public StudentPreferenceDTO createPreferences(StudentPreferenceDTO dto) {
        if (preferenceRepository.existsByStudentId(dto.getStudentId())) {
            throw new RuntimeException("Preferences already exist for student ID: " + dto.getStudentId());
        }

        StudentPreference preference = convertToEntity(dto);
        preference.setCreatedAt(LocalDateTime.now());
        StudentPreference saved = preferenceRepository.save(preference);
        return convertToDTO(saved);
    }

    // Update existing preferences
    public StudentPreferenceDTO updatePreferences(Long studentId, StudentPreferenceDTO dto) {
        StudentPreference preference = preferenceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Preferences not found for student ID: " + studentId));

        // Update fields
        preference.setRoomType(dto.getRoomType());
        preference.setSleepTime(dto.getSleepTime());
        preference.setWakeUpTime(dto.getWakeUpTime());
        preference.setNoisePreference(dto.getNoisePreference());
        preference.setCleanlinessLevel(dto.getCleanlinessLevel());
        preference.setStudyFrequency(dto.getStudyFrequency());
        preference.setStudyEnvironment(dto.getStudyEnvironment());
        preference.setSocialPreference(dto.getSocialPreference());
        preference.setPersonalSpace(dto.getPersonalSpace());
        preference.setVisitorPreference(dto.getVisitorPreference());
        preference.setSubmitted(dto.getSubmitted());
        preference.setUpdatedAt(LocalDateTime.now());

        StudentPreference updated = preferenceRepository.save(preference);
        return convertToDTO(updated);
    }

    // Save or update preferences (upsert)
    public StudentPreferenceDTO saveOrUpdatePreferences(StudentPreferenceDTO dto) {
        Optional<StudentPreference> existing = preferenceRepository.findByStudentId(dto.getStudentId());
        
        if (existing.isPresent()) {
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

    // Helper methods for conversion
    public StudentPreferenceDTO convertToDTO(StudentPreference entity) {
        StudentPreferenceDTO dto = new StudentPreferenceDTO();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setRoomType(entity.getRoomType());
        dto.setSleepTime(entity.getSleepTime());
        dto.setWakeUpTime(entity.getWakeUpTime());
        dto.setNoisePreference(entity.getNoisePreference());
        dto.setCleanlinessLevel(entity.getCleanlinessLevel());
        dto.setStudyFrequency(entity.getStudyFrequency());
        dto.setStudyEnvironment(entity.getStudyEnvironment());
        dto.setSocialPreference(entity.getSocialPreference());
        dto.setPersonalSpace(entity.getPersonalSpace());
        dto.setVisitorPreference(entity.getVisitorPreference());
        dto.setSubmitted(entity.getSubmitted());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private StudentPreference convertToEntity(StudentPreferenceDTO dto) {
        StudentPreference entity = new StudentPreference();
        entity.setStudentId(dto.getStudentId());
        entity.setRoomType(dto.getRoomType());
        entity.setSleepTime(dto.getSleepTime());
        entity.setWakeUpTime(dto.getWakeUpTime());
        entity.setNoisePreference(dto.getNoisePreference());
        entity.setCleanlinessLevel(dto.getCleanlinessLevel());
        entity.setStudyFrequency(dto.getStudyFrequency());
        entity.setStudyEnvironment(dto.getStudyEnvironment());
        entity.setSocialPreference(dto.getSocialPreference());
        entity.setPersonalSpace(dto.getPersonalSpace());
        entity.setVisitorPreference(dto.getVisitorPreference());
        entity.setSubmitted(dto.getSubmitted());
        return entity;
    }
}
