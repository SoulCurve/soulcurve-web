"""Signed session cookie.

There's no persistent user database yet in Phase 1 (see docs/DECISIONS.md —
the Neon decision isn't implemented yet); the session is just a signed,
timestamped cookie carrying steam_id. Nothing is stored server-side.
"""

import os

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

SESSION_COOKIE_NAME = "soulcurve_session"
_MAX_AGE_SECONDS = 30 * 24 * 60 * 60  # 30 days

_serializer = URLSafeTimedSerializer(os.environ.get("SESSION_SECRET", "dev-insecure-secret"))


def create_session_cookie(steam_id: str) -> str:
    return _serializer.dumps({"steam_id": steam_id})


def read_session_cookie(cookie_value: str | None) -> str | None:
    if not cookie_value:
        return None
    try:
        data = _serializer.loads(cookie_value, max_age=_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None
    return data.get("steam_id")
