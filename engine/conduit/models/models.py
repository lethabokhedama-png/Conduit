"""
Models accessor — loads usage.model.py and health.model.py via importlib
and re-exports their public API.
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

_usage = _load("usage.model.py")
_health = _load("health.model.py")

# Usage model
UsageStat = _usage.UsageStat

# Health model
HealthScore = _health.HealthScore
compute_health_score = _health.compute_health_score