from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_match_map_shape():
    body = client.get("/api/matches/12345678/map").json()
    assert body["match_id"] == 12345678
    assert body["kills"]
    for kill in body["kills"]:
        assert 0 <= kill["x"] <= 1
        assert 0 <= kill["y"] <= 1
    times = [k["t_min"] for k in body["kills"]]
    assert times == sorted(times)
    assert client.get("/api/matches/12345678/map").json() == body


def test_objectives_agree_with_win_probability_events():
    events = client.get("/api/matches/12345678/win-probability").json()["events"]
    objectives = client.get("/api/matches/12345678/map").json()["objectives"]
    for event in events:
        # The team in an event is the one that took the objective, so the owner is the other side.
        assert any(
            o["name"] == event["detail"]
            and o["destroyed_at"] == event["t_min"]
            and o["owner"] != event["team"]
            for o in objectives
        )
