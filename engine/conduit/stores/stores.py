"""
Store accessor — loads redis.store.py and postgres.store.py (dotted filenames)
via importlib and re-exports their public API so other modules can import
from conduit.stores.stores instead of dealing with dotted filenames.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

_DIR = Path(__file__).parent

def _load(filename: str):
    spec = importlib.util.spec_from_file_location(
        filename.replace(".", "_"), _DIR / filename
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_redis = _load("redis.store.py")
_pg = _load("postgres.store.py")

# Redis
get_redis = _redis.get_redis
close_redis = _redis.close_redis
get_all_usage_keys = _redis.get_all_usage_keys
get_usage_hash = _redis.get_usage_hash
set_health_score = _redis.set_health_score
usage_key = _redis.usage_key
health_key = _redis.health_key
USAGE_PREFIX = _redis.USAGE_PREFIX
HEALTH_PREFIX = _redis.HEALTH_PREFIX

# Postgres
get_pool = _pg.get_pool
close_pool = _pg.close_pool