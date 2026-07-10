"""Pydantic models for usage stats — mirrors gateway's UsageStat interface."""

from __future__ import annotations
from pydantic import BaseModel


class UsageStat(BaseModel):
    provider: str
    request_count: int = 0
    error_count: int = 0
    rate_limit_hits: int = 0
    total_latency_ms: int = 0
    total_tokens: int = 0
    total_cost_usd: float = 0.0
    last_used_at: int | None = None
    last_error: str | None = None

    @classmethod
    def from_redis_hash(cls, provider: str, data: dict[str, str]) -> "UsageStat":
        """Parse the camelCase Redis hash that the gateway writes."""
        return cls(
            provider=provider,
            request_count=int(data.get("requestCount", 0)),
            error_count=int(data.get("errorCount", 0)),
            rate_limit_hits=int(data.get("rateLimitHits", 0)),
            total_latency_ms=int(data.get("totalLatencyMs", 0)),
            total_tokens=int(data.get("totalTokens", 0)),
            total_cost_usd=float(data.get("totalCostUsd", 0.0)),
            last_used_at=int(data["lastUsedAt"]) if "lastUsedAt" in data else None,
            last_error=data.get("lastError"),
        )