"""
Engine configuration — loaded once at startup from environment / .env file.
"""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Walk up from cwd looking for a .env file (mirrors gateway behaviour)
_cwd = Path.cwd()
for _candidate in [_cwd / ".env", _cwd.parent / ".env", _cwd.parent.parent / ".env"]:
    if _candidate.exists():
        load_dotenv(_candidate, override=False)
        break


class Config:
    # Database
    postgres_url: str = os.environ.get("POSTGRES_URL", "")
    redis_url: str = os.environ.get("REDIS_URL", "redis://localhost:6379")

    # Self-ping keepalive (empty = disabled)
    self_url: str = os.environ.get("SELF_URL", "")

    # Engine port (informational — uvicorn is launched externally)
    port: int = int(os.environ.get("ENGINE_PORT", "8000"))

    # Known provider IDs — must match gateway's PROVIDER_ENV_MAP keys
    known_providers: tuple[str, ...] = (
        "anthropic",
        "openai",
        "google",
        "groq",
        "stability",
        "serpapi",
        "brave",
        "ollama",
    )


config = Config()