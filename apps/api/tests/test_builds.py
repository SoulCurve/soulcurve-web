from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_hero_builds_shape(deadlock_api):
    response = client.get("/api/stats/heroes/1/builds")
    assert response.status_code == 200
    body = response.json()
    assert body["hero_id"] == 1
    assert len(body["builds"]) == 3
    for build in body["builds"]:
        assert len(build["items"]) == 4
        assert len(set(build["items"])) == 4
        assert 0.0 <= build["win_rate"] <= 1.0

    win_rates = [b["win_rate"] for b in body["builds"]]
    assert win_rates == sorted(win_rates, reverse=True)


def test_hero_builds_404_for_unknown_hero(deadlock_api):
    response = client.get("/api/stats/heroes/999999/builds")
    assert response.status_code == 404


def test_hero_builds_deterministic(deadlock_api):
    first = client.get("/api/stats/heroes/2/builds").json()
    again = client.get("/api/stats/heroes/2/builds").json()
    assert first == again


def test_build_authors_are_distinct():
    authors = [b["author"] for b in client.get("/api/stats/heroes/1/builds").json()["builds"]]
    assert len(set(authors)) == len(authors)


def test_hero_builds_rank_filter(deadlock_api):
    base = client.get("/api/stats/heroes/1/builds").json()
    ranked = client.get("/api/stats/heroes/1/builds", params={"rank": "Eternus"}).json()
    assert ranked["rank"] == "Eternus"
    assert base["rank"] is None
    assert [b["win_rate"] for b in ranked["builds"]] != [b["win_rate"] for b in base["builds"]]

    bad = client.get("/api/stats/heroes/1/builds", params={"rank": "Nope"})
    assert bad.status_code == 422
