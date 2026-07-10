"""Health score model — mirrors gateway's computeHealthScore logic exactly."""

from __future__ import annotations
from pydantic import BaseModel


class UsageStatInput(BaseModel):
    provider: str
    request_count: int = 0
    error_count: int = 0
    rate_limit_hits: int = 0
    total_latency_ms: int = 0


class HealthScore(BaseModel):
    provider: str
    score: float          # [0, 1]
    error_rate: float
    rate_limit_rate: float
    avg_latency_ms: float
    request_count: int


def compute_health_score(provider: str, stat: dict) -> HealthScore:
    """
    Mirrors gateway's computeHealthScore() in redis.usage.ts exactly:
      - 0 requests → 0.75 (neutral default)
      - error_rate       × 0.50
      - rate_limit_rate  × 0.35
      - latency_penalty  × 0.15  (capped at 10 000 ms avg)

    stat: raw dict from Redis hash (camelCase keys matching the gateway).
    """
    request_count = int(stat.get("requestCount", 0))

    if request_count == 0:
        return HealthScore(
            provider=provider,
            score=0.75,
            error_rate=0.0,
            rate_limit_rate=0.0,
            avg_latency_ms=0.0,
            request_count=0,
        )

    error_count = int(stat.get("errorCount", 0))
    rate_limit_hits = int(stat.get("rateLimitHits", 0))
    total_latency_ms = int(stat.get("totalLatencyMs", 0))

    error_rate = error_count / request_count
    rate_limit_rate = rate_limit_hits / request_count
    avg_latency = total_latency_ms / request_count
    latency_penalty = min(avg_latency / 10_000, 1.0)

    raw = 1.0 - error_rate * 0.50 - rate_limit_rate * 0.35 - latency_penalty * 0.15
    score = max(0.0, min(1.0, raw))

    return HealthScore(
        provider=provider,
        score=score,
        error_rate=error_rate,
        rate_limit_rate=rate_limit_rate,
        avg_latency_ms=avg_latency,
        request_count=request_count,
    )