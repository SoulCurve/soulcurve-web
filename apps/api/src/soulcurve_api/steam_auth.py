"""Steam OpenID 2.0 sign-in.

Steam only implements enough of OpenID 2.0 to authenticate a SteamID64: the
client redirects to Steam's login page, Steam redirects back with signed
openid.* parameters, and the server confirms the signature with a
server-to-server "check_authentication" call before trusting the claimed id.

Docs: https://partner.steamgames.com/doc/features/auth#website
"""

import re
from urllib.parse import urlencode

import httpx

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
_CLAIMED_ID_RE = re.compile(r"^https://steamcommunity\.com/openid/id/(\d{17})/?$")


def build_login_url(return_to: str, realm: str) -> str:
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.return_to": return_to,
        "openid.realm": realm,
    }
    return f"{STEAM_OPENID_URL}?{urlencode(params)}"


async def verify_callback(params: dict[str, str]) -> str | None:
    """Returns the verified SteamID64, or None if the signature is invalid."""
    claimed_id = params.get("openid.claimed_id", "")
    match = _CLAIMED_ID_RE.match(claimed_id)
    if not match:
        return None

    check_params = dict(params)
    check_params["openid.mode"] = "check_authentication"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(STEAM_OPENID_URL, data=check_params)

    if "is_valid:true" not in response.text:
        return None
    return match.group(1)
