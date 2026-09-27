from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_hero_stats_shape():
    response = client.get("/api/stats/heroes")
    assert response.status_code == 200
    body = response.json()
    assert body["patch"]
    assert len(body["heroes"]) > 0
    for hero in body["heroes"]:
        assert 0.0 <= hero["win_rate"] <= 1.0
        assert 0.0 <= hero["pick_rate"] <= 1.0


def test_hero_item_stats_shape():
    heroes = client.get("/api/stats/heroes").json()["heroes"]
    hero_id = heroes[0]["hero_id"]

    response = client.get(f"/api/stats/heroes/{hero_id}/items")
    assert response.status_code == 200
    body = response.json()
    assert body["hero_id"] == hero_id
    assert len(body["items"]) > 0
    for item in body["items"]:
        assert 0.0 <= item["win_rate"] <= 1.0


def test_hero_item_stats_404_for_unknown_hero():
    response = client.get("/api/stats/heroes/999999/items")
    assert response.status_code == 404


def test_ranks_list():
    response = client.get("/api/stats/ranks")
    assert response.status_code == 200
    ranks = response.json()
    assert "Eternus" in ranks
    assert "Obscurus" in ranks


def test_hero_stats_filtered_by_rank():
    response = client.get("/api/stats/heroes", params={"rank": "Eternus"})
    assert response.status_code == 200
    body = response.json()
    assert body["rank"] == "Eternus"
    assert len(body["heroes"]) == 8
    for hero in body["heroes"]:
        assert 0.0 <= hero["win_rate"] <= 1.0
        assert 0.0 <= hero["pick_rate"] <= 1.0

    # deterministic: same rank -> same numbers
    again = client.get("/api/stats/heroes", params={"rank": "Eternus"}).json()
    assert again["heroes"] == body["heroes"]

    # a different rank should (almost certainly) shift at least one number
    other = client.get("/api/stats/heroes", params={"rank": "Obscurus"}).json()
    assert other["heroes"] != body["heroes"]


def test_hero_stats_rejects_unknown_rank():
    response = client.get("/api/stats/heroes", params={"rank": "Legendary"})
    assert response.status_code == 422
