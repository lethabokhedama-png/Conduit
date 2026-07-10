"""GET /health — engine liveness probe."""

from __future__ import annotations

from fastapi import APIRouter
from conduit.stores.stores import get_redis, get_pool

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Returns overall engine health — checks Redis and Postgres connectivity.
    Always returns HTTP 200; the `status` field indicates health.
    Used by Docker HEALTHCHECK, gateway status aggregator, and keepalive.
    """
    redis_ok = False
    postgres_ok = False

    try:
        await get_redis().ping()
        redis_ok = True
    except Exception:
        pass

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        postgres_ok = True
    except Exception:
        pass

    status = "ok" if redis_ok and postgres_ok else "degraded"
    return {"status": status, "redis": redis_ok, "postgres": postgres_ok}