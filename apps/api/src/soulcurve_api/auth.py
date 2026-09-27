"""Steam ile giriş uçları.

Akış: /auth/steam/login kullanıcıyı Steam'e yönlendirir → Steam kullanıcıyı
/auth/steam/callback'e geri gönderir → imza doğrulanır → imzalı oturum
çerezi set edilip frontend'e geri yönlendirilir.
"""

import os

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

from soulcurve_api import steam_auth
from soulcurve_api.session import SESSION_COOKIE_NAME, create_session_cookie, read_session_cookie

router = APIRouter()


def _api_base_url() -> str:
    return os.environ.get("API_BASE_URL", "http://localhost:8000")


def _web_origin() -> str:
    return os.environ.get("WEB_ORIGIN", "http://localhost:5173")


@router.get("/auth/steam/login")
def steam_login() -> RedirectResponse:
    api_base = _api_base_url()
    login_url = steam_auth.build_login_url(
        return_to=f"{api_base}/auth/steam/callback",
        realm=api_base,
    )
    return RedirectResponse(login_url)


@router.get("/auth/steam/callback")
async def steam_callback(request: Request) -> RedirectResponse:
    steam_id = await steam_auth.verify_callback(dict(request.query_params))
    web_origin = _web_origin()
    if steam_id is None:
        return RedirectResponse(f"{web_origin}/?login=failed")

    response = RedirectResponse(f"{web_origin}/")
    response.set_cookie(
        SESSION_COOKIE_NAME,
        create_session_cookie(steam_id),
        httponly=True,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
    )
    return response


@router.post("/auth/logout")
def logout() -> RedirectResponse:
    response = RedirectResponse(f"{_web_origin()}/", status_code=303)
    response.delete_cookie(SESSION_COOKIE_NAME)
    return response


@router.get("/api/me")
def me(request: Request) -> dict[str, str | None]:
    steam_id = read_session_cookie(request.cookies.get(SESSION_COOKIE_NAME))
    return {"steam_id": steam_id}
