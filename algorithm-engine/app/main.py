"""
Stable Roomies — Algorithm Engine
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routers import allocation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure DB tables exist."""
    logger.info("Starting Algorithm Engine — creating DB tables if needed…")
    create_tables()
    logger.info("DB tables ready.")
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

# Allow calls from the frontend and admin dashboard during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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