"""News / patch notes feed.

Will be replaced with a real content source in M4+ (an admin-authored feed,
or a scraper over Deadlock's own patch notes); for now it returns fixed
mock data shaped like the real contract, newest first.
"""

from fastapi import APIRouter

from soulcurve_api.models import NewsItem, NewsResponse

router = APIRouter()

_MOCK_NEWS: list[NewsItem] = [
    NewsItem(
        id=3,
        title="SoulCurve match analysis is live",
        date="2026-09-27",
        tag="news",
        summary="See your win-probability curve and a 10-point mistake score for any match.",
    ),
    NewsItem(
        id=2,
        title="Patch mock-patch-1.0: hero balance pass",
        date="2026-09-20",
        tag="patch-notes",
        summary="Adjustments to Abrams, Bebop and Ivy win rates across ranked matches.",
    ),
    NewsItem(
        id=1,
        title="SoulCurve general stats page is live",
        date="2026-09-14",
        tag="news",
        summary="Browse hero win rates and drill into the most popular items per hero.",
    ),
]


@router.get("/api/news")
def news() -> NewsResponse:
    return NewsResponse(items=_MOCK_NEWS)
