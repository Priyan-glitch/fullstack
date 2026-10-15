"""
Stable Roomies — Algorithm Engine
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import create_tables
from app.routers import allocation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure DB tables exist and start RabbitMQ background worker."""
    logger.info("Starting Algorithm Engine — creating DB tables if needed…")
    create_tables()
    logger.info("DB tables ready.")

    # Start RabbitMQ background worker daemon thread
    try:
        from app.worker import start_worker_thread
        logger.info("Starting RabbitMQ background worker…")
        start_worker_thread()
    except Exception as e:
        logger.exception("Failed to start RabbitMQ background worker: %s", e)

    yield
    logger.info("Algorithm Engine shutting down.")


app = FastAPI(
    title="Stable Roomies — Algorithm Engine",
    description=(
        "Pluggable roommate allocation engine. "
        "Supports multiple strategies (Graph Clustering / Louvain, and future ones). "
        "Admin triggers a run; result is saved as DRAFT for review before approval."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# No CORSMiddleware here on purpose. The gateway is the single CORS authority for
# /api/*, and it writes Access-Control-Allow-Origin before proxying; the upstream
# response headers are then merged in. A second value from this engine makes the
# response carry
#   Access-Control-Allow-Origin: http://localhost:5174
#   Access-Control-Allow-Origin: *
# and browsers reject a multi-valued origin outright, failing every request that
# touches the engine. Nothing else calls this service from a browser.

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(allocation.router)


# ── Health / root ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "UP", "service": "algorithm-engine", "version": "1.0.0"}


@app.get("/", tags=["System"])
def root():
    return {
        "service": "Stable Roomies Algorithm Engine",
        "docs": "/docs",
        "strategies": "/api/v1/allocation/strategies",
    }