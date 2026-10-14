package com.stableroomies.notificationservice.controller;

import com.stableroomies.notificationservice.dto.NotificationDTO;
import com.stableroomies.notificationservice.dto.NotificationListResponse;
import com.stableroomies.notificationservice.model.Notification;
import com.stableroomies.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API for the Notification Service.
 *
 * Base URL: /api/notifications
 *
 * Endpoints:
 *   GET    /api/notifications/{userId}           — all notifications for user
 *   GET    /api/notifications/{userId}/unread    — unread count only
 *   POST   /api/notifications/{userId}/mark-all-read
 *   PATCH  /api/notifications/{id}/read?userId=  — mark single as read
 *   DELETE /api/notifications/{id}               — delete
 *   POST   /api/notifications/create             — direct creation (admin only)
 *   GET    /api/notifications/health             — health check
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all notifications for a user (admin or student ID).
     */
    @GetMapping("/{userId}")
    public ResponseEntity<NotificationListResponse> getNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getForUser(userId));
    }

    /**
     * Get unread notification count for a user.
     */
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count, "userId", (long) userId.hashCode()));
    }

    /**
     * Mark a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markRead(
            @PathVariable Long id,
            @RequestParam String userId) {
        boolean success = notificationService.markRead(id, userId);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "id", id));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Mark all notifications as read for a user.
     */
    @PostMapping("/{userId}/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllRead(@PathVariable String userId) {
        int updated = notificationService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("success", true, "updatedCount", updated));
    }

    /**
     * Delete a notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        boolean deleted = notificationService.delete(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Directly create a notification (useful for admin broadcasts or testing).
     */
    @PostMapping("/create")
    public ResponseEntity<Notification> create(@RequestBody Map<String, String> body) {
        String userId = body.getOrDefault("userId", "admin");
        String type = body.getOrDefault("type", "INFO");
        String title = body.getOrDefault("title", "Notification");
        String message = body.getOrDefault("message", "");
        String referenceId = body.get("referenceId");

        Notification n = notificationService.create(userId, type, title, message, referenceId);
        return ResponseEntity.ok(n);
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "notification-service",
                "version", "1.0.0"
        ));
    }
}

