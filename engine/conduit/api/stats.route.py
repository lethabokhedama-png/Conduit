"""GET /stats — live aggregation snapshot for the runtime dashboard."""

from __future__ import annotations

from fastapi import APIRouter
from conduit.stores.stores import (
    get_all_usage_keys, get_usage_hash, get_redis, HEALTH_PREFIX
)
from conduit.models.models import UsageStat
from conduit.scheduler.scheduler_jobs import scheduler

router = APIRouter()


@router.get("/stats")
async def get_stats():
    """
    Returns per-provider usage stats, cached health scores, and scheduler
    job next-fire times. Internal — not exposed publicly in production.
    """
    providers = await get_all_usage_keys()

    usage_stats = []
    for provider in sorted(providers):
        raw = await get_usage_hash(provider)
        if raw:
            usage_stats.append(UsageStat.from_redis_hash(provider, raw).model_dump())

    # Cached health scores
    r = get_redis()
    health_keys = await r.keys(f"{HEALTH_PREFIX}*")
    health_scores: dict[str, float] = {}
    for key in health_keys:
        val = await r.get(key)
        if val is not None:
            health_scores[key.removeprefix(HEALTH_PREFIX)] = float(val)

    # Scheduler job info
    jobs = [
        {
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
        }
        for job in scheduler.get_jobs()
    ]

    return {"usage": usage_stats, "health_scores": health_scores, "jobs": jobs}