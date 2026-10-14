package com.stableroomies.studentservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_preferences")
public class StudentPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private Long studentId;
    
    // Room preferences (legacy — primary for Strategy 1)
    @Column(nullable = false)
    private String roomType; // "2_SHARING" or "3_SHARING"

    @Column(length = 20)
    private String acPreference; // "AC", "NON_AC", "BOTH"

    // Ranked room-type preferences (Strategy 2 — PreferenceQueueLouvain)
    // Each stores one of: "INDIVIDUAL", "2_SHARING", "3_SHARING", "4_SHARING"
    @Column(length = 20)
    private String roomTypePreference1; // 1st choice

    @Column(length = 20)
    private String roomTypePreference2; // 2nd choice

    @Column(length = 20)
    private String roomTypePreference3; // 3rd choice

    // Preferred roommate IDs (comma-separated, e.g. "3,7")
    @Column(columnDefinition = "TEXT")
    private String preferredRoommateIds;
    
    // Lifestyle preferences
    private String sleepTime;
    private String wakeUpTime;
    private String studyTiming; // "MORNING_PERSON", "NIGHT_OWL", "FLEXIBLE"
    private String noisePreference;
    private Integer cleanlinessLevel;
    
    // Study and Social
    private String studyPreference; // "ALONE", "GROUP_STUDY", "DOESNT_MATTER"
    private String studyFrequency;
    private String studyEnvironment;
    private String socialPreference;
    private String personalSpace;
    private String visitorPreference;
    
    // Status
    private Boolean submitted;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Constructors
    public StudentPreference() {
        this.submitted = false;
        this.createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
    public void setRoomTypePreference1(String roomTypePreference1) { this.roomTypePreference1 = roomTypePreference1; }

    public String getRoomTypePreference2() { return roomTypePreference2; }
    public void setRoomTypePreference2(String roomTypePreference2) { this.roomTypePreference2 = roomTypePreference2; }

    public String getRoomTypePreference3() { return roomTypePreference3; }
    public void setRoomTypePreference3(String roomTypePreference3) { this.roomTypePreference3 = roomTypePreference3; }

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

    public String getPreferredRoommateIds() { return preferredRoommateIds; }
    public void setPreferredRoommateIds(String preferredRoommateIds) { this.preferredRoommateIds = preferredRoommateIds; }

    public Boolean getSubmitted() { return submitted; }
    public void setSubmitted(Boolean submitted) { this.submitted = submitted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /**
     * Returns the submission timestamp as ISO-8601 string for the algorithm-engine.
     * Uses updatedAt when submitted (the last update before locking), falls back to createdAt.
     */
    @Transient
    public String getSubmittedAt() {
        if (Boolean.TRUE.equals(this.submitted)) {
            LocalDateTime ts = (this.updatedAt != null) ? this.updatedAt : this.createdAt;
            return ts != null ? ts.toString() : null;
        }
        return null;
    }
}
