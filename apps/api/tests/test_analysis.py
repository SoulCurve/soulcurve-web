from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_match_analysis_shape():
    response = client.get("/api/matches/1/analysis")
    assert response.status_code == 200
    body = response.json()
    assert body["match_id"] == 1
    assert 0.0 <= body["score"] <= 10.0
    assert len(body["moments"]) > 0
    for moment in body["moments"]:
        assert moment["type"] in {
            "death",
            "objective_loss",
            "objective_win",
            "good_trade",
            "rotation",
        }


def test_match_analysis_score_reflects_mistakes():
    response = client.get("/api/matches/1/analysis")
    body = response.json()
    negative_total = sum(m["wpa_delta"] for m in body["moments"] if m["wpa_delta"] < 0)
    assert negative_total < 0
    assert body["score"] < 10.0


def test_match_analysis_404_for_invalid_match_id():
    response = client.get("/api/matches/0/analysis")
    assert response.status_code == 404
