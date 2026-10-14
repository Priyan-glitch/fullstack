package com.stableroomies.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Incoming event payload published by other services (Algorithm Engine, etc.)
 * via RabbitMQ to notification.queue.
 *
 * Example payload:
 * {
 *   "eventType": "ALLOCATION_APPROVED",
 *   "runId": "abc-123",
 *   "runBy": "admin",
 *   "totalStudents": 10,
 *   "allocatedCount": 8,
 *   "studentIds": ["13","15","19"],
 *   "year": 4,
 *   "strategy": "graph_clustering"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEventDTO {
    private String eventType;       // ALLOCATION_CREATED | ALLOCATION_APPROVED | ALLOCATION_REJECTED | ROOM_ASSIGNED
    private String runId;
    private String runBy;
    private Integer totalStudents;
    private Integer allocatedCount;
    private String[] studentIds;    // affected student IDs (for targeted student notifications)
    private Integer year;
    private String strategy;
    private String message;         // optional custom message override
}
