# Docker Deployment

## Prerequisites

- Docker + Docker Compose installed
- Git

## Deploy

```bash
git clone https://github.com/picklem0b/Conduit.git
cd Conduit
cp .env.example .env
```

Edit `.env` — at minimum set:
- `POSTGRES_PASSWORD` — change from the default
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- At least one provider API key

```bash
docker compose up --build -d
```

Gateway is live at `http://localhost:4000`

## Run database migrations

```bash
docker compose exec gateway bun run migrate
```

## Check logs

```bash
docker compose logs -f gateway
docker compose logs -f engine
```

## Stop

```bash
docker compose down
```

## Stop and remove all data

```bash
docker compose down -v
```

## Update

```bash
git pull
docker compose up --build -d
docker compose exec gateway bun run migrate
```

## Ports

| Service | Port |
|---------|------|
| Gateway | 4000 |
| Engine | 8000 (internal only) |
| Postgres | 5432 (internal only) |
| Redis | 6379 (internal only) |

Only the gateway port is exposed externally. Everything else is on the internal `conduit` Docker network.

## Running interfaces

Each interface is a separate Vite app. To run locally:

```bash
cd interfaces/chat
npm install
npm run dev
```

Set `VITE_GATEWAY_URL=http://localhost:4000` in the interface's `.env`.
