# Tester Interface

API key discovery and system health. Paste any key — the tester tells you what it works with, what it can do, and whether everything is running.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Probe | `/` | Paste a key, discover what providers and capabilities it unlocks |
| Status | `/status` | Public health view — all mirrors, gateway, engine, database, redis |

## Gateway endpoints used

| Endpoint | Purpose |
|----------|---------|
| `POST /api/discovery/probe` | Test key against all known providers |
| `GET /api/status` | Public health status for all services |
| `GET /api/providers/health` | Detailed per-provider health (latency, error rate) |

## Probe flow

1. User pastes a key
2. `POST /api/discovery/probe` tests it against every known adapter across all categories simultaneously
3. Results come back as an array of matches — provider name, category, status, latency, capabilities
4. `result.card.tsx` renders each match with `capability.badge.tsx` showing what the key can actually do
5. User can save the key directly from the result card — `POST /api/keys`

## Status page

Matches the Miruro-style reference — per-service uptime pill, response latency, last checked timestamp. Public, no auth required. Corresponds to `GET /api/status` which pings configured mirrors and services from `conduit.config.toml`.
