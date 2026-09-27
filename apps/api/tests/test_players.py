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
