# Render Deployment

Render's free tier works well for the gateway and engine. Postgres and Redis are available as managed add-ons.

## Services to create

### 1. Postgres (managed)
- Create a new Postgres database on Render
- Copy the internal connection string — use this for `POSTGRES_URL`

### 2. Redis (managed)
- Create a new Redis instance on Render
- Copy the internal connection string — use this for `REDIS_URL`

### 3. Gateway (web service)
- **Environment:** Docker
- **Root directory:** `gateway/`
- **Build command:** *(handled by Dockerfile)*
- **Start command:** *(handled by Dockerfile)*
- **Port:** `4000`

Environment variables to set:
```
POSTGRES_URL        (from managed Postgres above)
REDIS_URL           (from managed Redis above)
JWT_SECRET          (openssl rand -hex 32)
CONDUIT_VERSION     (e.g. v0.1.0)
SELF_URL            (your Render public URL, for keepalive)
```

Add any provider API keys you want as env vars.

### 4. Engine (web service)
- **Environment:** Docker
- **Root directory:** `engine/`
- **Port:** `8000`

Same environment variables as gateway plus:
```
ENGINE_PORT=8000
```

## Keepalive

Set `SELF_URL` on the engine service to its public Render URL. The engine pings its own `/health` endpoint every 14 minutes so Render's free tier doesn't spin it down.

The gateway does not need a keepalive — it receives real traffic.

## Free tier limits

Render free tier spins down after 15 minutes of inactivity. The engine keepalive handles this for the engine. For the gateway, the tester interface's status page pings it regularly — so as long as someone has the status page open it stays warm.
