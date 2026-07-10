"""
cascade.aggregator — Schedule: every 10 minutes

Reads cascade_events (written by gateway on every model handoff) and logs
summary statistics used by the runtime dashboard.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta

from conduit.stores.stores import get_pool

logger = logging.getLogger("conduit.aggregators.cascade")

_LOOKBACK_MINUTES = 60


async def aggregate_cascade() -> None:
    """Summarises cascade events from the last hour."""
    pool = await get_pool()
    since = datetime.now(tz=timezone.utc) - timedelta(minutes=_LOOKBACK_MINUTES)

    async with pool.acquire() as conn:
        totals = await conn.fetchrow(
            """
            SELECT
                COUNT(*)                        AS total_events,
                COUNT(DISTINCT conversation_id) AS conversations,
                AVG(latency_ms)                 AS avg_latency_ms
            FROM cascade_events
            WHERE created_at >= $1
            """,
            since,
        )

        by_reason = await conn.fetch(
            """
            SELECT reason, COUNT(*) AS cnt
            FROM cascade_events WHERE created_at >= $1
            GROUP BY reason ORDER BY cnt DESC
            """,
            since,
        )

        by_profile = await conn.fetch(
            """
            SELECT profile, COUNT(*) AS cnt
            FROM cascade_events WHERE created_at >= $1
            GROUP BY profile ORDER BY cnt DESC LIMIT 5
            """,
            since,
        )

        by_from = await conn.fetch(
            """
            SELECT from_model, COUNT(*) AS cnt
            FROM cascade_events WHERE created_at >= $1
            GROUP BY from_model ORDER BY cnt DESC LIMIT 10
            """,
            since,
        )

    total_events = totals["total_events"] if totals else 0
    if total_events == 0:
        logger.debug("aggregate_cascade: no events in last %d minutes", _LOOKBACK_MINUTES)
        return

    avg_latency = round(totals["avg_latency_ms"] or 0, 1)
    logger.info(
        "aggregate_cascade: %d events / %d conversations | avg handoff %.1fms",
        total_events, totals["conversations"], avg_latency,
    )

    if by_reason:
        logger.info(
            "aggregate_cascade: by reason — %s",
            ", ".join(f"{r['reason']}={r['cnt']}" for r in by_reason),
        )
    if by_profile:
        logger.info(
            "aggregate_cascade: by profile — %s",
            ", ".join(f"{r['profile']}={r['cnt']}" for r in by_profile),
        )
    if by_from:
        logger.info(
            "aggregate_cascade: most cascaded-from — %s",
            ", ".join(f"{r['from_model']}={r['cnt']}" for r in by_from),
        )