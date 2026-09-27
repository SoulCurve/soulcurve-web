from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_win_probability_shape():
    response = client.get("/api/matches/12345678/win-probability")
    assert response.status_code == 200
    body = response.json()
    assert body["match_id"] == 12345678
    assert body["team_perspective"] in ("amber", "sapphire")
    assert body["winner"] in ("amber", "sapphire")
    assert len(body["points"]) > 0
    for point in body["points"]:
        assert 0.0 <= point["p_win"] <= 1.0
    for event in body["events"]:
        assert {"t_min", "type", "detail", "team"} <= event.keys()


def test_win_probability_match_id_must_be_int():
    response = client.get("/api/matches/not-an-id/win-probability")
    assert response.status_code == 422
