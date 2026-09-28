from fastapi.testclient import TestClient

from soulcurve_api.box_routes import BASES, _greedy_order, _loop_length, _optimal_order
from soulcurve_api.main import app

client = TestClient(app)


def test_box_routes_cover_each_half_once():
    body = client.get("/api/map/box-routes").json()
    crates = {c["id"]: c for c in body["crates"]}
    for route in body["routes"]:
        ids = [s["crate_id"] for s in route["stops"]]
        amber = route["team"] == "amber"
        own = {cid for cid, c in crates.items() if (c["y"] > 0.5) == amber}
        assert sorted(ids) == sorted(own)
        arrivals = [s["arrive_s"] for s in route["stops"]]
        assert arrivals == sorted(arrivals)
        assert route["loop_seconds"] <= route["naive_loop_seconds"]


def test_tunnel_crates_spawn_later():
    for crate in client.get("/api/map/box-routes").json()["crates"]:
        assert crate["spawn_min"] == (5 if crate["area"] == "tunnel" else 3)


def test_optimal_order_matches_brute_force():
    from itertools import permutations

    base = BASES["amber"]
    points = [(0.1, 0.7), (0.4, 0.6), (0.9, 0.8), (0.5, 0.9), (0.7, 0.55)]
    best = min(_loop_length(base, [points[i] for i in p]) for p in permutations(range(len(points))))
    got = _loop_length(base, [points[i] for i in _optimal_order(base, points)])
    assert abs(got - best) < 1e-9
    greedy = _loop_length(base, [points[i] for i in _greedy_order(base, points)])
    assert got <= greedy
