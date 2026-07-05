# Engine Scheduler

The engine uses APScheduler to run background jobs on a fixed interval. All jobs are defined in `engine/conduit/scheduler/scheduler.jobs.py` and configured in `scheduler.config.py`.

## Jobs

| Job | Interval | Description |
|-----|----------|-------------|
| `aggregate_usage` | 5 min | Reads Redis usage stats, writes summaries to Postgres |
| `recalculate_health` | 2 min | Recomputes provider health scores, writes to Redis |
| `aggregate_cascade` | 10 min | Tracks cascade event patterns, writes to Postgres |
| `keepalive` | 14 min | Pings `SELF_URL/health` to prevent free-tier host from sleeping |

## Adding a job

1. Write the job function in `aggregators/` or inline in `scheduler.jobs.py`
2. Register it in `scheduler.jobs.py` with `scheduler.add_job()`
3. Set the interval in `scheduler.config.py`

## Keepalive

Set `SELF_URL` in `.env` to your public deployment URL. If not set, keepalive is disabled — fine for paid hosting tiers that don't sleep.
