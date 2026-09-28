from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_news_shape():
    response = client.get("/api/news")
    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) > 0
    for item in body["items"]:
        assert item["tag"] in {"patch-notes", "news"}


def test_news_newest_first():
    response = client.get("/api/news")
    dates = [item["date"] for item in response.json()["items"]]
    assert dates == sorted(dates, reverse=True)
