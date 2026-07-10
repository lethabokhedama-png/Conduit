"""
Redis store — async connection pool shared across all aggregators.

Key conventions (must match gateway's redis.usage.ts exactly):
  conduit:usage:{provider}  — hash of raw usage counters
  conduit:health:{provider} — string, cached health score, TTL 120s
"""

from __future__ import annotations

import redis.asyncio as aioredis
from conduit.config import config

_pool: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(
            config.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=10,
        )
    return _pool


async def close_redis() -> None:
    global _pool
    if _pool is not None:
        await _pool.aclose()
        _pool = None


# ── Key helpers ───────────────────────────────────────────────────────────────

USAGE_PREFIX = "conduit:usage:"
HEALTH_PREFIX = "conduit:health:"


def usage_key(provider: str) -> str:
    return f"{USAGE_PREFIX}{provider}"


def health_key(provider: str) -> str:
    return f"{HEALTH_PREFIX}{provider}"


async def get_all_usage_keys() -> list[str]:
    """
    Discover all providers that have recorded usage in Redis.
    Returns provider names (not full keys).
    """
    r = get_redis()
    keys = await r.keys(f"{USAGE_PREFIX}*")
    return [k.removeprefix(USAGE_PREFIX) for k in keys]


async def get_usage_hash(provider: str) -> dict[str, str]:
    return await get_redis().hgetall(usage_key(provider))


async def set_health_score(provider: str, score: float, ttl: int = 120) -> None:
    await get_redis().setex(health_key(provider), ttl, f"{score:.6f}")