# Configuration

Conduit uses two config sources — `conduit.config.toml` for application config and `.env` for secrets.

## conduit.config.toml

Located at the repo root (and mirrored inside `gateway/` for Docker builds).

### `[app]`
| Key | Default | Description |
|-----|---------|-------------|
| `name` | `"Conduit"` | Application name |
| `port` | `4000` | Gateway port |
| `mode` | `"auto"` | UI mode: `auto`, `mobile`, `desktop` |

Version is resolved at runtime — not set here. See `gateway/src/config/utils/config.version.ts`.

### `[cascade.profiles.*]`
See [cascade.md](./cascade.md) for full field reference.

### `[data]`
| Key | Default | Description |
|-----|---------|-------------|
| `uploads_dir` | `"./data/uploads"` | Where uploaded files are stored |
| `sqlite_fallback` | `false` | Use SQLite instead of Postgres (single-machine only) |

### `[features]`
| Key | Default | Description |
|-----|---------|-------------|
| `cascade` | `true` | Enable cascade engine |
| `parallel` | `false` | Run multiple models in parallel (Projects) |
| `log_explorer` | `false` | Request log viewer |
| `split_view` | `false` | Side-by-side model comparison |
| `voice` | `false` | Voice input/output |

### `[sites]`
Maps hostnames to UI variants. Example:
```toml
[sites."chat.yourdomain.com"]
variant = "chat"
label   = "Conduit Chat"
```

### `[status_page]`
| Key | Description |
|-----|-------------|
| `mirrors` | Array of `{ label, url }` to ping for the public status page |
| `services` | Array of service names to display |

### `[license]`
| Key | Description |
|-----|-------------|
| `manifest_url` | URL of the signed version manifest. Leave blank to disable. |
| `check_interval_hours` | How often to re-check (default: 6) |
| `public_key` | Ed25519 public key matching the license server's private key |

## .env

See `.env.example` at the repo root for every variable with descriptions.
