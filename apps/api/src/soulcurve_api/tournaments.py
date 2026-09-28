"""Tournament and league pages.

No pro-match data source has been chosen yet; until then this returns fixed
mock events with fictional teams. Results are seeded so they're stable, and
standings are derived from the match results so the two always agree.
"""

import hashlib
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException

from soulcurve_api.models import (
    Tournament,
    TournamentListResponse,
    TournamentMatch,
    TournamentStanding,
    TournamentSummary,
)

router = APIRouter()

_TEAMS = [
    "Amber Hand",
    "Sapphire Flame",
    "Midnight Patrons",
    "Cursed Relic",
    "Veil Walkers",
    "Soul Urn",
    "Street Brawl",
    "Hidden King",
]

_EVENTS: list[TournamentSummary] = [
    TournamentSummary(
        slug="patron-cup-fall-2026",
        name="Patron Cup: Fall 2026",
        organizer="SoulCurve (mock)",
        start_date="2026-09-20",
        end_date="2026-10-04",
        status="live",
        prize_pool_usd=25000,
        team_count=6,
    ),
    TournamentSummary(
        slug="underground-league-s1",
        name="Underground League Season 1",
        organizer="SoulCurve (mock)",
        start_date="2026-08-01",
        end_date="2026-08-30",
        status="completed",
        prize_pool_usd=10000,
        team_count=8,
    ),
    TournamentSummary(
        slug="winter-invitational-2026",
        name="Winter Invitational 2026",
        organizer="SoulCurve (mock)",
        start_date="2026-12-05",
        end_date="2026-12-13",
        status="upcoming",
        prize_pool_usd=50000,
        team_count=4,
    ),
]


def _round_robin(teams: list[str]) -> list[tuple[str, str]]:
    # Circle method: every team plays exactly once per round.
    rotation = list(teams)
    pairs = []
    for _ in range(len(rotation) - 1):
        half = len(rotation) // 2
        pairs += list(zip(rotation[:half], reversed(rotation[half:]), strict=True))
        rotation = [rotation[0], rotation[-1], *rotation[1:-1]]
    return pairs


def _matches(event: TournamentSummary) -> list[TournamentMatch]:
    pairs = _round_robin(_TEAMS[: event.team_count])
    per_round = event.team_count // 2
    rounds = len(pairs) // per_round
    # A live event has played roughly its first two thirds of rounds.
    played_rounds = {"completed": rounds, "live": rounds * 2 // 3, "upcoming": 0}[event.status]
    played = played_rounds * per_round
    start = date.fromisoformat(event.start_date)
    matches = []
    for i, (team_a, team_b) in enumerate(pairs):
        seed = int(hashlib.sha256(f"{event.slug}:{i}".encode()).hexdigest(), 16)
        a_wins = seed % 2 == 0
        loser_maps = (seed // 2) % 2
        done = i < played
        matches.append(
            TournamentMatch(
                id=i + 1,
                round=f"Round {i // per_round + 1}",
                date=(start + timedelta(days=i // per_round)).isoformat(),
                team_a=team_a,
                team_b=team_b,
                score_a=(2 if a_wins else loser_maps) if done else None,
                score_b=(loser_maps if a_wins else 2) if done else None,
            )
        )
    return matches


def _standings(teams: list[str], matches: list[TournamentMatch]) -> list[TournamentStanding]:
    record = {team: [0, 0] for team in teams}
    for m in matches:
        if m.score_a is None or m.score_b is None:
            continue
        winner, loser = (m.team_a, m.team_b) if m.score_a > m.score_b else (m.team_b, m.team_a)
        record[winner][0] += 1
        record[loser][1] += 1
    ordered = sorted(teams, key=lambda t: (-record[t][0], record[t][1], t))
    return [
        TournamentStanding(rank=i + 1, team=t, wins=record[t][0], losses=record[t][1])
        for i, t in enumerate(ordered)
    ]


@router.get("/api/tournaments")
def list_tournaments() -> TournamentListResponse:
    return TournamentListResponse(tournaments=_EVENTS)


@router.get("/api/tournaments/{slug}")
def get_tournament(slug: str) -> Tournament:
    event = next((e for e in _EVENTS if e.slug == slug), None)
    if event is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    matches = _matches(event)
    return Tournament(
        **event.model_dump(),
        standings=_standings(_TEAMS[: event.team_count], matches),
        matches=matches,
    )
