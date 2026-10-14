"""
RabbitMQ Background Worker — Asynchronous Allocation Task Consumer.

Flow:
  1. Connects to RabbitMQ broker (AMQP).
  2. Declares durable queue 'allocation.queue' and binds to 'allocation.exchange' with 'allocation.trigger'.
  3. Consumes messages asynchronously.
  4. When a message is received:
     - Decodes JSON payload { jobId, strategy, year, runBy, notes }.
     - Calls svc.run_allocation(strategy, runBy, notes, db, year).
     - Persists the DRAFT allocation run and groups into PostgreSQL.
     - Acknowledges the RabbitMQ message.
"""
import json
import logging
import threading
import time
import pika

from app.config import get_settings
from app.database import SessionLocal
from app.services import allocation_service as svc

logger = logging.getLogger(__name__)

EXCHANGE_NAME = "allocation.exchange"
QUEUE_NAME = "allocation.queue"
ROUTING_KEY = "allocation.trigger"


def process_allocation_message(ch, method, properties, body):
    """Callback invoked when an allocation task message is received from RabbitMQ."""
    logger.info(" [x] Received allocation task from RabbitMQ: %r", body)
    db = SessionLocal()
    try:
        data = json.loads(body.decode("utf-8"))
        job_id = data.get("jobId")
        strategy = data.get("strategy", "graph_clustering")
        year = data.get("year", 4)
        run_by = data.get("runBy", "admin")
        notes = data.get("notes") or f"Triggered asynchronously via RabbitMQ (jobId={job_id})"

        logger.info(
            "Worker starting allocation: strategy=%s, year=%s, run_by=%s, job_id=%s",
            strategy, year, run_by, job_id,
        )

        run = svc.run_allocation(
            strategy_name=strategy,
            run_by=run_by,
            notes=notes,
            db=db,
            year=year,
        )

        logger.info(
            " [✓] Asynchronous allocation job %s completed successfully: run_id=%s, total_groups=%d",
            job_id, run.id, run.total_groups,
        )
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.exception("Error processing allocation message from RabbitMQ: %s", e)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    finally:
        db.close()


def start_worker():
    """Continuously runs the RabbitMQ consumer with automatic reconnection."""
    settings = get_settings()

    while True:
        try:
            logger.info("Connecting to RabbitMQ broker at %s ...", settings.rabbitmq_url)
            params = pika.URLParameters(settings.rabbitmq_url)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            # Declare durable exchange and queue
            channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="topic", durable=True)
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.queue_bind(exchange=EXCHANGE_NAME, queue=QUEUE_NAME, routing_key=ROUTING_KEY)

            # Fair dispatch — prefetch 1 message at a time
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_allocation_message)

            logger.info(" [*] RabbitMQ Allocation Worker waiting for messages on queue '%s'.", QUEUE_NAME)
            channel.start_consuming()

        except pika.exceptions.AMQPConnectionError as e:
            logger.warning("RabbitMQ connection error: %s. Retrying in 5 seconds...", e)
            time.sleep(5)
        except Exception as e:
            logger.exception("Unexpected error in RabbitMQ worker: %s. Retrying in 5 seconds...", e)
            time.sleep(5)


def start_worker_thread():
    """Spawns the RabbitMQ worker in a background daemon thread."""
    worker_thread = threading.Thread(target=start_worker, daemon=True, name="RabbitMQ-Allocation-Worker")
    worker_thread.start()
    logger.info("Started background RabbitMQ worker thread.")
    return worker_thread


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    start_worker()
