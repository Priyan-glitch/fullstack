package com.stableroomies.studentservice.dto;

import java.time.LocalDateTime;

public class StudentPreferenceDTO {
    private Long id;
    private Long studentId;
    private String roomType;
    private String acPreference; // "AC", "NON_AC", "BOTH"
    // Ranked room-type preferences for Strategy 2 (PreferenceQueueLouvain)
    private String roomTypePreference1;
    private String roomTypePreference2;
    private String roomTypePreference3;
    private String submittedAt;           // ISO-8601 timestamp — set only when submitted=true
    private String preferredRoommateIds; // comma-separated student IDs
    private String sleepTime;
    private String wakeUpTime;
    private String studyTiming; // "MORNING_PERSON", "NIGHT_OWL", "FLEXIBLE"
    private String noisePreference;
    private Integer cleanlinessLevel;
    private String studyPreference; // "ALONE", "GROUP_STUDY", "DOESNT_MATTER"
    private String studyFrequency;
    private String studyEnvironment;
    private String socialPreference;
    private String personalSpace;
    private String visitorPreference;
    private Boolean submitted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public StudentPreferenceDTO() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getAcPreference() { return acPreference; }
    public void setAcPreference(String acPreference) { this.acPreference = acPreference; }

    public String getRoomTypePreference1() { return roomTypePreference1; }
    public void setRoomTypePreference1(String v) { this.roomTypePreference1 = v; }

    public String getRoomTypePreference2() { return roomTypePreference2; }
    public void setRoomTypePreference2(String v) { this.roomTypePreference2 = v; }

    public String getRoomTypePreference3() { return roomTypePreference3; }
    public void setRoomTypePreference3(String v) { this.roomTypePreference3 = v; }

    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String getPreferredRoommateIds() { return preferredRoommateIds; }
    public void setPreferredRoommateIds(String preferredRoommateIds) { this.preferredRoommateIds = preferredRoommateIds; }

    public String getSleepTime() { return sleepTime; }
    public void setSleepTime(String sleepTime) { this.sleepTime = sleepTime; }

    public String getWakeUpTime() { return wakeUpTime; }
    public void setWakeUpTime(String wakeUpTime) { this.wakeUpTime = wakeUpTime; }

    public String getStudyTiming() { return studyTiming; }
    public void setStudyTiming(String studyTiming) { this.studyTiming = studyTiming; }

    public String getNoisePreference() { return noisePreference; }
    public void setNoisePreference(String noisePreference) { this.noisePreference = noisePreference; }

    public Integer getCleanlinessLevel() { return cleanlinessLevel; }
    public void setCleanlinessLevel(Integer cleanlinessLevel) { this.cleanlinessLevel = cleanlinessLevel; }

    public String getStudyPreference() { return studyPreference; }
    public void setStudyPreference(String studyPreference) { this.studyPreference = studyPreference; }

    public String getStudyFrequency() { return studyFrequency; }
    public void setStudyFrequency(String studyFrequency) { this.studyFrequency = studyFrequency; }

    public String getStudyEnvironment() { return studyEnvironment; }
    public void setStudyEnvironment(String studyEnvironment) { this.studyEnvironment = studyEnvironment; }

    public String getSocialPreference() { return socialPreference; }
    public void setSocialPreference(String socialPreference) { this.socialPreference = socialPreference; }

    public String getPersonalSpace() { return personalSpace; }
    public void setPersonalSpace(String personalSpace) { this.personalSpace = personalSpace; }

    public String getVisitorPreference() { return visitorPreference; }
    public void setVisitorPreference(String visitorPreference) { this.visitorPreference = visitorPreference; }

    public Boolean getSubmitted() { return submitted; }
    public void setSubmitted(Boolean submitted) { this.submitted = submitted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
