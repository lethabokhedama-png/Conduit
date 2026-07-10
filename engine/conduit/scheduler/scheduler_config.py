"""
Scheduler configuration — job intervals in seconds.

Keeping intervals here (rather than hardcoded in scheduler.jobs) means they're
easy to tune without touching job logic. All values are in seconds.
"""

# How often to flush Redis usage counters → Postgres usage_hourly
USAGE_AGGREGATOR_INTERVAL_SECONDS = 5 * 60      # 5 minutes

# How often to recompute provider health scores → Redis health cache
HEALTH_AGGREGATOR_INTERVAL_SECONDS = 2 * 60     # 2 minutes

# How often to summarise cascade events from Postgres
CASCADE_AGGREGATOR_INTERVAL_SECONDS = 10 * 60   # 10 minutes

# How often to ping SELF_URL/health (free-tier host sleep prevention)
KEEPALIVE_INTERVAL_SECONDS = 14 * 60            # 14 minutes