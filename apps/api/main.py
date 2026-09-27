"""Vercel Python entrypoint: re-exports the FastAPI app from src/soulcurve_api.

Vercel's Python runtime looks for `app` in a root-level file (this one); the
actual application code lives under src/ so it can be installed as a package
for local dev (uv) too.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from soulcurve_api.main import app  # noqa: E402
