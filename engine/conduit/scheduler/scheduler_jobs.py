"""
Scheduler jobs — registers all background tasks with APScheduler.

Job registration order:
  1. aggregate_usage      every 5 min  — Redis → Postgres usage_hourly
  2. recalculate_health   every 2 min  — Redis usage → Redis health cache
  3. aggregate_cascade    every 10 min — Postgres cascade_events → logs/stats
  4. keepalive            every 14 min — GET SELF_URL/health (free-tier only)

Aggregator files use the project's dot-naming convention (e.g. usage.aggregator.py).
We load them at runtime using importlib.util so the filenames don't need to be
valid Python module identifiers.

Adding a job:
  1. Write the async function in aggregators/ following the *.aggregator.py convention.
  2. Load it below with _load_aggregator().
  3. Call scheduler.add_job() with trigger="interval" and seconds=<interval>.
  4. Add the interval constant to scheduler.config.py.
"""

from __future__ import annotations

import importlib.util
import logging
from pathlib import Path
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from conduit.scheduler.scheduler_config import (
    USAGE_AGGREGATOR_INTERVAL_SECONDS,
    HEALTH_AGGREGATOR_INTERVAL_SECONDS,
    CASCADE_AGGREGATOR_INTERVAL_SECONDS,
    KEEPALIVE_INTERVAL_SECONDS,
)
from conduit.config import config

logger = logging.getLogger("conduit.scheduler")

scheduler = AsyncIOScheduler(timezone="UTC")

_AGGREGATORS_DIR = Path(__file__).parent.parent / "aggregators"


def _load_aggregator(filename: str, fn_name: str):
    """
    Loads a function from an aggregator file whose name contains dots
    (e.g. usage.aggregator.py), which Python can't import as a standard module.
    """
    path = _AGGREGATORS_DIR / filename
    spec = importlib.util.spec_from_file_location(filename.replace(".", "_"), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, fn_name)


# Load aggregator functions at module import time
aggregate_usage = _load_aggregator("usage.aggregator.py", "aggregate_usage")
recalculate_health = _load_aggregator("health.aggregator.py", "recalculate_health")
aggregate_cascade = _load_aggregator("cascade.aggregator.py", "aggregate_cascade")


# ── Keepalive job ─────────────────────────────────────────────────────────────

async def _keepalive() -> None:
    """
    Pings SELF_URL/health to prevent the engine from sleeping on free-tier
    hosting. Disabled when SELF_URL is not set.
    """
    if not config.self_url:
        return

    url = f"{config.self_url.rstrip('/')}/health"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            logger.debug("keepalive: %s → %d", url, resp.status_code)
    except Exception as exc:
        logger.warning("keepalive: failed to ping %s — %s", url, exc)


# ── Job registration ──────────────────────────────────────────────────────────

def register_jobs() -> None:
    """
    Registers all scheduled jobs. Called once at startup from main.py.
    Jobs fire on interval from the moment the scheduler starts.
    """
    scheduler.add_job(
        aggregate_usage,
        trigger="interval",
        seconds=USAGE_AGGREGATOR_INTERVAL_SECONDS,
        id="aggregate_usage",
        name="Usage aggregator (Redis → Postgres)",
        max_instances=1,
        coalesce=True,
    )

    scheduler.add_job(
        recalculate_health,
        trigger="interval",
        seconds=HEALTH_AGGREGATOR_INTERVAL_SECONDS,
        id="recalculate_health",
        name="Health score recalculator (Redis → Redis)",
        max_instances=1,
        coalesce=True,
    )

    scheduler.add_job(
        aggregate_cascade,
        trigger="interval",
        seconds=CASCADE_AGGREGATOR_INTERVAL_SECONDS,
        id="aggregate_cascade",
        name="Cascade event aggregator (Postgres → logs)",
        max_instances=1,
        coalesce=True,
    )

    scheduler.add_job(
        _keepalive,
        trigger="interval",
        seconds=KEEPALIVE_INTERVAL_SECONDS,
        id="keepalive",
        name="Keepalive ping (SELF_URL/health)",
        max_instances=1,
        coalesce=True,
    )

    logger.info(
        "scheduler: registered jobs — usage=%ds health=%ds cascade=%ds keepalive=%ds",
        USAGE_AGGREGATOR_INTERVAL_SECONDS,
        HEALTH_AGGREGATOR_INTERVAL_SECONDS,
        CASCADE_AGGREGATOR_INTERVAL_SECONDS,
        KEEPALIVE_INTERVAL_SECONDS,
    )