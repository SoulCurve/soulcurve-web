import respx
from fastapi.testclient import TestClient
from httpx import Response

from soulcurve_api.main import app
from soulcurve_api.session import SESSION_COOKIE_NAME, read_session_cookie

client = TestClient(app)


def test_steam_login_redirects_to_steam():
    response = client.get("/auth/steam/login", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert response.headers["location"].startswith("https://steamcommunity.com/openid/login")


@respx.mock
def test_steam_callback_sets_session_cookie_on_success():
    respx.post("https://steamcommunity.com/openid/login").mock(
        return_value=Response(200, text="is_valid:true\n")
    )
    response = client.get(
        "/auth/steam/callback",
        params={"openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000000"},
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "login=failed" not in response.headers["location"]
    cookie = response.cookies.get(SESSION_COOKIE_NAME)
    assert cookie is not None
    assert read_session_cookie(cookie) == "76561198000000000"
    client.cookies.delete(SESSION_COOKIE_NAME)


@respx.mock
def test_steam_callback_rejects_invalid_signature():
    respx.post("https://steamcommunity.com/openid/login").mock(
        return_value=Response(200, text="is_valid:false\n")
    )
    response = client.get(
        "/auth/steam/callback",
        params={"openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000000"},
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "login=failed" in response.headers["location"]
    assert SESSION_COOKIE_NAME not in response.cookies


def test_me_without_cookie():
    response = client.get("/api/me")
    assert response.status_code == 200
    assert response.json() == {"steam_id": None}


def test_me_with_valid_cookie():
    from soulcurve_api.session import create_session_cookie

    client.cookies.set(SESSION_COOKIE_NAME, create_session_cookie("76561198000000000"))
    response = client.get("/api/me")
    assert response.json() == {"steam_id": "76561198000000000"}
    client.cookies.delete(SESSION_COOKIE_NAME)
