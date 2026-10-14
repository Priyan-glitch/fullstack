package com.stableroomies.notificationservice.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stableroomies.notificationservice.dto.NotificationEventDTO;
import com.stableroomies.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * RabbitMQ consumer that listens on 'notification.queue'.
 *
 * Other services (algorithm-engine) publish events here when allocation
 * state changes: created, approved, rejected.
 */
@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @RabbitListener(queues = "${rabbitmq.notification.queue:notification.queue}")
    public void handleNotificationEvent(Object messagePayload) {
        try {
            NotificationEventDTO event;

            // Handle Spring AMQP Message, byte[], Map (from JSON converter), and String (raw JSON)
            if (messagePayload instanceof org.springframework.amqp.core.Message springMessage) {
                event = objectMapper.readValue(springMessage.getBody(), NotificationEventDTO.class);
            } else if (messagePayload instanceof byte[] bytes) {
                event = objectMapper.readValue(bytes, NotificationEventDTO.class);
            } else if (messagePayload instanceof java.util.Map<?, ?> mapPayload) {
                event = objectMapper.convertValue(mapPayload, NotificationEventDTO.class);
            } else if (messagePayload instanceof String strPayload) {
                event = objectMapper.readValue(strPayload, NotificationEventDTO.class);
            } else {
                log.warn("Unrecognized notification event payload type: {}", messagePayload.getClass());
                return;
            }

            log.info("[Notification Consumer] Received event: type={}, runId={}", event.getEventType(), event.getRunId());
            processEvent(event);

        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
        }
    }

    private void processEvent(NotificationEventDTO event) {
        String type = event.getEventType();
        if (type == null) {
            log.warn("Notification event has no eventType, skipping.");
            return;
        }

        switch (type) {
            case "ALLOCATION_CREATED" -> notificationService.notifyAllocationCreated(
                    event.getRunId(),
                    event.getRunBy(),
                    event.getTotalStudents() != null ? event.getTotalStudents() : 0,
                    event.getAllocatedCount() != null ? event.getAllocatedCount() : 0,
                    event.getYear(),
                    event.getStrategy() != null ? event.getStrategy() : "unknown"
            );
            case "ALLOCATION_APPROVED" -> notificationService.notifyAllocationApproved(
                    event.getRunId(),
                    event.getRunBy(),
                    event.getTotalStudents() != null ? event.getTotalStudents() : 0,
                    event.getAllocatedCount() != null ? event.getAllocatedCount() : 0,
                    event.getStudentIds(),
                    event.getYear()
            );
            case "ALLOCATION_REJECTED" -> notificationService.notifyAllocationRejected(
                    event.getRunId(),
                    event.getRunBy(),
                    event.getYear()
            );
            default -> log.warn("Unknown notification event type: {}", type);
        }
    }
}
