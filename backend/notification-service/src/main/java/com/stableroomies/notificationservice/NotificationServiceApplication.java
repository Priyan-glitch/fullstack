package com.stableroomies.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

/**
 * Stable Roomies — Notification Service
 *
 * Responsibilities:
 *   - Persist in-app notifications per user (admin / student)
 *   - Consume RabbitMQ events from Algorithm Engine (allocation created, approved, rejected)
 *   - Provide REST API for frontend polling of notifications
 *
 * Port: 8084
 */
@SpringBootApplication
public class NotificationServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.setProperty("user.timezone", "UTC");
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
