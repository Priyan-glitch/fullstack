"""
RabbitMQ Publisher for Notification Events.

Publishes notification events to 'notification.exchange' with routing key 'notification.event'.
Consumed by notification-service to persist in DB and alert users.
"""
import json
import logging
import pika

from app.config import get_settings

logger = logging.getLogger(__name__)

NOTIFICATION_EXCHANGE = "notification.exchange"
NOTIFICATION_ROUTING_KEY = "notification.event"


def publish_notification_event(
    event_type: str,
    run_id: str,
    run_by: str = "admin",
    total_students: int = 0,
    allocated_count: int = 0,
    student_ids: list[str] | None = None,
    year: int | None = None,
    strategy: str | None = None,
    message: str | None = None,
) -> bool:
    """
    Publish an event to RabbitMQ for the notification-service.
    Fail-safe: catches exceptions and logs warning without breaking caller.
    """
    settings = get_settings()
    payload = {
        "eventType": event_type,
        "runId": run_id,
        "runBy": run_by,
        "totalStudents": total_students,
        "allocatedCount": allocated_count,
        "studentIds": student_ids or [],
        "year": year,
        "strategy": strategy,
        "message": message,
    }

    try:
        params = pika.URLParameters(settings.rabbitmq_url)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(
            exchange=NOTIFICATION_EXCHANGE,
            exchange_type="topic",
            durable=True,
        )

        body_bytes = json.dumps(payload).encode("utf-8")
        channel.basic_publish(
            exchange=NOTIFICATION_EXCHANGE,
            routing_key=NOTIFICATION_ROUTING_KEY,
            body=body_bytes,
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,  # make message persistent
            ),
        )

        connection.close()
        logger.info(
            "Published %s notification event to RabbitMQ for run %s (%d students)",
            event_type, run_id, len(student_ids or []),
        )
        return True

    except Exception as e:
        logger.warning(
            "Failed to publish %s notification event to RabbitMQ: %s",
            event_type, e,
        )
        return False
