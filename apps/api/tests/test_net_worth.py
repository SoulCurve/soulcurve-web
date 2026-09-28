from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_net_worth_tracks_win_probability():
    points = client.get("/api/matches/1/net-worth").json()["points"]
    wp = client.get("/api/matches/1/win-probability").json()["points"]
    assert [p["t_min"] for p in points] == [p["t_min"] for p in wp]
    for nw, w in zip(points, wp, strict=True):
        assert (nw["amber"] > nw["sapphire"]) == (w["p_win"] > 0.5)
    totals = [p["amber"] + p["sapphire"] for p in points]
    assert totals == sorted(totals)
