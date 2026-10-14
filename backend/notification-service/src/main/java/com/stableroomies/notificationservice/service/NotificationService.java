package com.stableroomies.notificationservice.service;

import com.stableroomies.notificationservice.dto.NotificationDTO;
import com.stableroomies.notificationservice.dto.NotificationListResponse;
import com.stableroomies.notificationservice.model.Notification;
import com.stableroomies.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core notification CRUD service.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository repository;

    // ── Create ─────────────────────────────────────────────────────────────────

    public Notification create(String userId, String type, String title, String message, String referenceId) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = repository.save(n);
        log.info("Notification created: id={}, userId={}, type={}", saved.getId(), userId, type);
        return saved;
    }

    // ── Retrieve ───────────────────────────────────────────────────────────────

    public NotificationListResponse getForUser(String userId) {
        List<Notification> all = repository.findByUserIdOrderByCreatedAtDesc(userId);
        long unread = repository.countByUserIdAndReadFalse(userId);
        List<NotificationDTO> dtos = all.stream().map(this::toDTO).collect(Collectors.toList());
        return NotificationListResponse.builder()
                .notifications(dtos)
                .unreadCount(unread)
                .totalCount(all.size())
                .build();
    }

    public long countUnread(String userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    // ── Mark read ──────────────────────────────────────────────────────────────

    @Transactional
    public boolean markRead(Long notificationId, String userId) {
        int updated = repository.markRead(notificationId, userId);
        return updated > 0;
    }

    @Transactional
    public int markAllRead(String userId) {
        return repository.markAllRead(userId);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    @Transactional
    public boolean delete(Long notificationId) {
        if (repository.existsById(notificationId)) {
            repository.deleteById(notificationId);
            return true;
        }
        return false;
    }

    // ── Allocation lifecycle notifications ─────────────────────────────────────

    /**
     * Create admin notification when an allocation run is created (DRAFT).
     */
    public void notifyAllocationCreated(String runId, String runBy, int totalStudents, int allocatedCount, Integer year, String strategy) {
        String yearLabel = year != null ? "Year " + year : "All Years";
        create(
                "admin",
                "ALLOCATION_CREATED",
                "Allocation Run Ready for Review",
                String.format(
                        "A new %s allocation run (%s) was completed: %d/%d students allocated. Strategy: %s. Awaiting your approval.",
                        yearLabel, runId.substring(0, 8) + "…", allocatedCount, totalStudents, strategy
                ),
                runId
        );
    }

    /**
     * Create admin and student notifications when an allocation run is approved.
     */
    public void notifyAllocationApproved(String runId, String runBy, int totalStudents, int allocatedCount, String[] studentIds, Integer year) {
        String yearLabel = year != null ? "Year " + year : "All Years";

        // Admin notification
        create(
                "admin",
                "ALLOCATION_APPROVED",
                "Allocation Approved & Published",
                String.format(
                        "Allocation run %s… has been approved. %d/%d students have been assigned rooms (%s).",
                        runId.substring(0, 8), allocatedCount, totalStudents, yearLabel
                ),
                runId
        );

        // Per-student notifications
        if (studentIds != null) {
            for (String sid : studentIds) {
                create(
                        sid,
                        "ROOM_ASSIGNED",
                        "🎉 Your Room Has Been Assigned!",
                        "Great news! The admin has approved the room allocation. Your room assignment is now ready. Check the 'My Room' section for full details including your roommates.",
                        runId
                );
            }
        }
    }

    /**
     * Create admin notification when an allocation run is rejected.
     */
    public void notifyAllocationRejected(String runId, String runBy, Integer year) {
        String yearLabel = year != null ? "Year " + year : "All Years";
        create(
                "admin",
                "ALLOCATION_REJECTED",
                "Allocation Run Rejected",
                String.format(
                        "Allocation run %s… (%s) has been rejected. You can trigger a new allocation run at any time.",
                        runId.substring(0, 8), yearLabel
                ),
                runId
        );
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
