from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_player_matches_shape():
    response = client.get("/api/players/76561198000000000/matches")
    assert response.status_code == 200
    body = response.json()
    assert body["steam_id"] == "76561198000000000"
    assert len(body["matches"]) == 10
    for match in body["matches"]:
        assert match["result"] in ("win", "loss")
        assert match["duration_min"] > 0


def test_player_matches_deterministic():
    first = client.get("/api/players/123/matches").json()
    again = client.get("/api/players/123/matches").json()
    assert first["matches"] == again["matches"]

    other = client.get("/api/players/456/matches").json()
    assert other["matches"] != first["matches"]


def test_leaderboard_is_ordered_and_stable():
    body = client.get("/api/leaderboard").json()
    players = body["players"]
    assert [p["position"] for p in players] == list(range(1, len(players) + 1))
    ratings = [p["rating"] for p in players]
    assert ratings == sorted(ratings, reverse=True)
    assert client.get("/api/leaderboard").json() == body
