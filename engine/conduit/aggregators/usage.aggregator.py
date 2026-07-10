"""
usage.aggregator — Schedule: every 5 minutes

Reads raw usage counters from Redis (written by the gateway on every request)
and upserts them into Postgres `usage_hourly`, bucketed to the current hour.
The gateway reads live Redis values for cascade decisions; Postgres is for
the dashboard and long-term analytics.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from conduit.stores.stores import get_all_usage_keys, get_usage_hash, get_pool
from conduit.models.models import UsageStat

logger = logging.getLogger("conduit.aggregators.usage")


def _hour_bucket() -> datetime:
    now = datetime.now(tz=timezone.utc)
    return now.replace(minute=0, second=0, microsecond=0)


async def aggregate_usage() -> None:
    """
    For each provider with recorded usage in Redis, upsert the current totals
    into usage_hourly for the current hour bucket. Idempotent — safe to run
    multiple times within the same hour.
    """
    providers = await get_all_usage_keys()
    if not providers:
        logger.debug("aggregate_usage: no provider keys found in Redis")
        return

    bucket = _hour_bucket()
    pool = await get_pool()
    upserted = 0

    for provider in providers:
        raw = await get_usage_hash(provider)
        if not raw:
            continue

        stat = UsageStat.from_redis_hash(provider, raw)

        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO usage_hourly (
                    provider, bucket,
                    request_count, error_count, rate_limit_hits,
                    total_latency_ms, total_tokens, total_cost_usd
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (provider, bucket) DO UPDATE SET
                    request_count    = EXCLUDED.request_count,
                    error_count      = EXCLUDED.error_count,
                    rate_limit_hits  = EXCLUDED.rate_limit_hits,
                    total_latency_ms = EXCLUDED.total_latency_ms,
                    total_tokens     = EXCLUDED.total_tokens,
                    total_cost_usd   = EXCLUDED.total_cost_usd
                """,
                provider, bucket,
                stat.request_count, stat.error_count, stat.rate_limit_hits,
                stat.total_latency_ms, stat.total_tokens, stat.total_cost_usd,
            )
        upserted += 1

    logger.info(
        "aggregate_usage: upserted %d provider(s) for bucket %s",
        upserted, bucket.isoformat()
    )