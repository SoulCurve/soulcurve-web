from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_blog_list_shape():
    response = client.get("/api/blog")
    assert response.status_code == 200
    body = response.json()
    assert len(body["posts"]) > 0
    assert "body" not in body["posts"][0]


def test_blog_post_found():
    slug = client.get("/api/blog").json()["posts"][0]["slug"]
    response = client.get(f"/api/blog/{slug}")
    assert response.status_code == 200
    assert response.json()["slug"] == slug
    assert response.json()["body"]


def test_blog_post_not_found():
    response = client.get("/api/blog/does-not-exist")
    assert response.status_code == 404
