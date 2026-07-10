"""
health.aggregator — Schedule: every 2 minutes

Recalculates health scores for every known provider, writes the scores back
to Redis so the cascade engine reads a fresh pre-computed value rather than
re-deriving from raw counters on every request.

The score formula exactly mirrors gateway's computeHealthScore() in redis.usage.ts.
"""

from __future__ import annotations

import logging

from conduit.stores.stores import get_all_usage_keys, get_usage_hash, set_health_score
from conduit.models.models import compute_health_score
from conduit.config import config

logger = logging.getLogger("conduit.aggregators.health")


async def recalculate_health() -> None:
    """
    Scores all providers that have Redis usage data, plus any known providers
    from config that haven't been seen yet (they get 0.75 neutral default).
    """
    redis_providers = set(await get_all_usage_keys())
    all_providers = redis_providers | set(config.known_providers)

    scored = 0
    for provider in all_providers:
        raw = await get_usage_hash(provider) if provider in redis_providers else {}
        health = compute_health_score(provider, raw)
        await set_health_score(provider, health.score)
        scored += 1

    logger.info("recalculate_health: scored %d provider(s)", scored)