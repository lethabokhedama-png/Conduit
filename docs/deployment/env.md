# Environment Variables

Full reference for every variable in `.env.example`.

## Gateway

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GATEWAY_PORT` | No | `4000` | Port the gateway listens on |
| `CONDUIT_VERSION` | No | auto | Version string — resolved from git tag if not set |
| `JWT_SECRET` | Yes | — | Secret for signing tokens. Generate: `openssl rand -hex 32` |

## Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | No | `conduit` | Postgres username |
| `POSTGRES_PASSWORD` | Yes | `conduit` | Postgres password — change this |
| `POSTGRES_DB` | No | `conduit` | Postgres database name |
| `POSTGRES_URL` | No | auto-built | Full connection string — only set for external databases |

## Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string |

## Provider API Keys

All optional — keys can also be saved via the UI (preferred). These are fallbacks.

| Variable | Provider |
|----------|----------|
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| `OPENAI_API_KEY` | OpenAI (GPT + DALL-E) |
| `GOOGLE_API_KEY` | Google (Gemini) |
| `GROQ_API_KEY` | Groq |
| `STABILITY_API_KEY` | Stability AI |
| `SERPAPI_API_KEY` | SerpAPI |
| `BRAVE_SEARCH_API_KEY` | Brave Search |

## Ollama

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | URL of your local Ollama instance |

## License

| Variable | Description |
|----------|-------------|
| `LICENSE_MANIFEST_URL` | URL of the signed version manifest. Leave blank to disable version locking. |
| `LICENSE_PUBLIC_KEY` | Ed25519 public key matching the license server. |

## Engine

| Variable | Default | Description |
|----------|---------|-------------|
| `ENGINE_PORT` | `8000` | Port the engine listens on |
| `SELF_URL` | — | Public URL for keepalive pings on free-tier hosts |
