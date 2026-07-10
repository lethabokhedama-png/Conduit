"""
Conduit Engine — FastAPI entry point.

Startup sequence:
  1. Load environment config
  2. Mount API routes (/health, /stats)
  3. Register APScheduler jobs
  4. Start the scheduler on the FastAPI lifespan event

Shutdown sequence:
  1. Stop the scheduler (waits for running jobs to complete)
  2. Close Redis and Postgres connection pools
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from conduit.scheduler.scheduler_jobs import scheduler, register_jobs
from conduit.stores.stores import close_redis, close_pool

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)

logger = logging.getLogger("conduit.engine")


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("engine: starting up")
    register_jobs()
    scheduler.start()
    logger.info("engine: scheduler started — %d jobs registered", len(scheduler.get_jobs()))

    yield

    logger.info("engine: shutting down")
    scheduler.shutdown(wait=True)
    await close_redis()
    await close_pool()
    logger.info("engine: shutdown complete")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Conduit Engine",
    description="Background aggregation engine for the Conduit gateway",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

# ── Routes ────────────────────────────────────────────────────────────────────

# Load route modules via importlib (dotted filenames)
import importlib.util
from pathlib import Path

_API_DIR = Path(__file__).parent / "api"

def _load_router(filename: str):
    spec = importlib.util.spec_from_file_location(
        filename.replace(".", "_"), _API_DIR / filename
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.router

app.include_router(_load_router("health.route.py"))
app.include_router(_load_router("stats.route.py"))

logger.info("engine: routes registered — /health, /stats")