# Cascade

Cascade is Conduit's automatic model fallback system. When a model hits a rate limit, errors out, or exceeds a cost cap, the cascade engine switches to the next model in the chain — summarizing the conversation so the new model picks up exactly where the last one left off.

## When cascade activates

Cascade only activates when:
- 2 or more providers are configured (single-key users get plain chat)
- `features.cascade = true` in `conduit.config.toml`
- `cascadeEnabled: true` is sent in the chat request payload

## How it works

1. User sends a message
2. Gateway builds the model chain from the selected cascade profile
3. Chain is re-ranked by live provider health scores (from Redis) — highest health first
4. Gateway tries the first model
5. On error or rate limit:
   - A `cascade` SSE event is emitted to the frontend
   - If `compress_on_handoff = true`, the conversation so far is summarized using the `compressor` model
   - The summary becomes the system context for the next model
   - Next model in the chain is tried
6. On success, usage stats are recorded to Redis

## Health scoring

Each provider gets a live health score `[0, 1]` based on:
- Error rate (50% weight)
- Rate limit hit rate (35% weight)
- Average response latency (15% weight)

New providers default to `0.75` (neutral, not penalized).

## Cascade profiles

Defined in `conduit.config.toml` under `[cascade.profiles.*]`.

| Field | Type | Description |
|-------|------|-------------|
| `chain` | string[] | Ordered list of model IDs |
| `token_threshold` | float | Switch at this fraction of context window used |
| `cost_cap_usd` | float | Switch when this cost is exceeded |
| `compress_on_handoff` | bool | Summarize context before switching |
| `compressor` | string | Model used to summarize (cheap/fast recommended) |
| `reverse_cascade` | bool | Try to return to a better model after switching down |
| `retry_on_error` | int | Number of retries before cascading |
