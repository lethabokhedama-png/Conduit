# Gateway Routes

Base URL: `http://localhost:4000`

All routes are prefixed with `/api`.

## Public (no auth, no version lock)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Gateway health check |
| GET | `/api/status` | Public status — all mirrors and services |
| GET | `/api/sites/config` | Returns UI variant for the current hostname |
| GET | `/api/license` | Current version lock status |
| GET | `/api/keys` | List saved keys (metadata only, no raw values) |
| POST | `/api/keys` | Save a key — validates against provider before storing |
| POST | `/api/keys/introspect` | Test a key without saving |
| DELETE | `/api/keys/:provider` | Remove a saved key |
| POST | `/api/discovery/probe` | Test any key against all known providers |

## Version-locked (blocked if below minimum version)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/models` | List all models across configured providers |
| POST | `/api/chat/stream` | Stream a chat response (SSE) |
| GET | `/api/chat/history/:conversationId` | Get message history for a conversation |
| GET | `/api/providers/health` | Live health check for all providers |
| POST | `/api/media/generate` | Generate image/video/audio |
| GET | `/api/media/providers` | List configured image providers and models |
| POST | `/api/search/query` | Run a search query |
| GET | `/api/search/providers` | List configured search providers |
| POST | `/api/code/execute` | Execute code in a sandbox |

## SSE Event Types (`/api/chat/stream`)

| Type | Payload | Description |
|------|---------|-------------|
| `token` | `{ content, model, tokens, costUsd }` | Streamed token chunk |
| `cascade` | `{ from, to, reason, at }` | Model handoff event |
| `done` | `{ totalTokens, totalCostUsd, durationMs }` | Stream complete |
| `error` | `{ error, code }` | Stream error |
