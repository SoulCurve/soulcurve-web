from fastapi.testclient import TestClient

from soulcurve_api.main import app

client = TestClient(app)


def test_tournament_list():
    body = client.get("/api/tournaments").json()
    statuses = {t["status"] for t in body["tournaments"]}
    assert statuses == {"upcoming", "live", "completed"}


def test_tournament_standings_match_results():
    for summary in client.get("/api/tournaments").json()["tournaments"]:
        body = client.get(f"/api/tournaments/{summary['slug']}").json()
        assert len(body["standings"]) == summary["team_count"]
        played = [m for m in body["matches"] if m["score_a"] is not None]
        assert sum(s["wins"] for s in body["standings"]) == len(played)
        assert sum(s["losses"] for s in body["standings"]) == len(played)
        if summary["status"] == "upcoming":
            assert not played
        if summary["status"] == "completed":
            assert len(played) == len(body["matches"])


def test_tournament_404():
    assert client.get("/api/tournaments/nope").status_code == 404


def test_each_team_plays_once_per_round():
    body = client.get("/api/tournaments/underground-league-s1").json()
    rounds: dict[str, list[str]] = {}
    for m in body["matches"]:
        rounds.setdefault(m["round"], []).extend([m["team_a"], m["team_b"]])
    assert len(rounds) == body["team_count"] - 1
    for teams in rounds.values():
        assert len(teams) == len(set(teams)) == body["team_count"]
