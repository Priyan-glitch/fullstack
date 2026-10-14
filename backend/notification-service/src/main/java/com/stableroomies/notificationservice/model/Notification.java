package com.stableroomies.notificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Persistent in-app notification record.
 * One row per notification per recipient.
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Target user: "admin" or student ID (e.g. "13") */
    @Column(nullable = false)
    private String userId;

    /** Notification type: ALLOCATION_CREATED, ALLOCATION_APPROVED, ALLOCATION_REJECTED, ROOM_ASSIGNED */
    @Column(nullable = false)
    private String type;

    /** Short headline */
    @Column(nullable = false)
    private String title;

    /** Detailed message body */
    @Column(columnDefinition = "TEXT")
    private String message;

    /** Related entity ID (e.g. run_id or student_id) */
    private String referenceId;

    /** Whether the user has seen/dismissed the notification */
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
