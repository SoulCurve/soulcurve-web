from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_model_info_shape():
    response = client.get("/api/model")
    assert response.status_code == 200
    body = response.json()
    assert body["model_version"]
    assert len(body["metrics"]) > 0
    assert len(body["features"]) > 0
    assert body["summary"]
