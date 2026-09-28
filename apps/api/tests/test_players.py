from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)

STEAM_ID = "76561198090955509"


def test_player_matches_shape(deadlock_api):
    response = client.get(f"/api/players/{STEAM_ID}/matches")
    assert response.status_code == 200
    body = response.json()
    assert body["steam_id"] == STEAM_ID
    assert len(body["matches"]) == 2
    for match in body["matches"]:
        assert match["result"] in ("win", "loss")
        assert match["duration_min"] > 0
    # first mock row: player_team == match_result -> win; second: mismatch -> loss
    assert body["matches"][0]["result"] == "win"
    assert body["matches"][1]["result"] == "loss"


def test_player_matches_rejects_non_numeric_steam_id():
    response = client.get("/api/players/not-a-steam-id/matches")
    assert response.status_code == 422


def test_player_profile_rejects_non_numeric_steam_id():
    response = client.get("/api/players/not-a-steam-id/profile")
    assert response.status_code == 422


def test_leaderboard_is_ordered_and_stable(deadlock_api):
    body = client.get("/api/leaderboard").json()
    players = body["players"]
    assert [p["position"] for p in players] == list(range(1, len(players) + 1))
    assert client.get("/api/leaderboard").json() == body


def test_leaderboard_disambiguates_ambiguous_name(deadlock_api):
    players = client.get("/api/leaderboard").json()["players"]
    ambiguous = next(p for p in players if p["name"] == "Ambiguous")
    assert ambiguous["steam_id"] == str(9002 + 76561197960265728)


def test_player_matches_names_leaderboard_players(deadlock_api):
    top = client.get("/api/leaderboard").json()["players"][0]
    assert client.get(f"/api/players/{top['steam_id']}/matches").json()["name"] == top["name"]
    non_leaderboard_steam_id = "76561199999999999"
    assert non_leaderboard_steam_id != top["steam_id"]
    assert client.get(f"/api/players/{non_leaderboard_steam_id}/matches").json()["name"] is None


def test_player_profile_shape(deadlock_api):
    body = client.get(f"/api/players/{STEAM_ID}/profile").json()
    assert body["steam_id"] == STEAM_ID
    categories = [g["category"] for g in body["grades"]]
    assert categories == ["Laning", "Farming", "Teamfighting", "Objectives"]
    assert 0 <= body["skill_percentile"] < 1
    tones = [t["tone"] for t in body["tendencies"]]
    assert tones in (["strength", "weakness"], ["strength"], ["weakness"], [])

    # deterministic given the same (mocked) rank data
    again = client.get(f"/api/players/{STEAM_ID}/profile").json()
    assert body == again
