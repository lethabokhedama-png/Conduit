# Engine Aggregators

The engine runs scheduled Python jobs that read from Redis and Postgres, aggregate usage data, and write summaries back — so the gateway's health scoring stays accurate over time without the gateway doing heavy computation on every request.

## usage.aggregator

Reads raw request counts, error counts, and latency totals from Redis per provider. Aggregates into hourly and daily summaries written to Postgres `usage_stats` table. Gateway reads the live Redis values for cascade decisions; the Postgres summaries are for the dashboard and long-term analysis.

**Schedule:** every 5 minutes

## health.aggregator

Recalculates health scores for every provider based on the last 1 hour of usage data. Writes scores back to Redis so the cascade engine always has a fresh picture without computing from raw data on every request.

**Schedule:** every 2 minutes

## cascade.aggregator

Tracks cascade events — how often each provider is being switched away from, which profile is most used, average handoff latency. Written to Postgres for the runtime dashboard.

**Schedule:** every 10 minutes
