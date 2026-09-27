"""İmzalı oturum çerezi.

Faz 1'de kalıcı bir kullanıcı veritabanı yok (bkz. docs/DECISIONS.md — Neon
kararı henüz uygulanmadı); oturum, steam_id'yi taşıyan imzalı+zaman damgalı
bir çerezden ibaret. Sunucu tarafında hiçbir şey saklanmaz.
"""

import os

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

SESSION_COOKIE_NAME = "soulcurve_session"
_MAX_AGE_SECONDS = 30 * 24 * 60 * 60  # 30 gün

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
