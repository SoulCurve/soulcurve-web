"""Blog posts.

Will be replaced with a real content source (CMS or MDX in-repo) once there's
an editorial workflow; for now it returns fixed mock long-form posts, newest
first, shaped like the real contract.
"""

from fastapi import APIRouter, HTTPException

from soulcurve_api.models import BlogListResponse, BlogPost, BlogPostSummary

router = APIRouter()

_MOCK_POSTS: list[BlogPost] = [
    BlogPost(
        slug="what-is-a-mistake-score",
        title="What is a mistake score?",
        date="2026-09-25",
        author="SoulCurve Team",
        excerpt=(
            "How the 0-10 score on each match analysis page is calculated, "
            "and why it only penalizes, never rewards."
        ),
        body=(
            "Every match analysis page shows a single number from 0 to 10: your mistake "
            "score for that match. It starts at 10 and loses points for moments that "
            "measurably dropped your team's win probability — a bad death, a missed "
            "rotation, a lost objective fight.\n\n"
            "The score is deliberately one-sided. Good plays are shown on the timeline "
            "for context, but they don't add points back. The goal isn't a balanced "
            "report card; it's a fast way to find what to work on. A 9.2 means a clean "
            "game. A 4.5 means there were one or two costly moments worth reviewing.\n\n"
            "Today the underlying win-probability model is a fixed mock curve (see the "
            "Model page for the full picture on that). Once the real model lands, the "
            "score will be computed from actual match state instead of a fixed shape, "
            "but the scoring logic — penalize negative moments, don't net them against "
            "good ones — stays the same."
        ),
    ),
    BlogPost(
        slug="reading-the-tier-list",
        title="How to read the hero tier list",
        date="2026-09-18",
        author="SoulCurve Team",
        excerpt="S through D, what the cutoffs mean, and why pick rate isn't part of the ranking.",
        body=(
            "The tier list on the Stats page sorts every hero into five bands — S, A, B, "
            "C, D — purely by win rate: S is 54%+, A is 51-54%, B is 48-51%, C is "
            "45-48%, and D is anything below that.\n\n"
            "On purpose, pick rate doesn't move a hero between tiers. A hero picked in "
            "2% of games with a 55% win rate is still S tier; the list is about how "
            "strong a hero is when played, not how popular they are. Pick rate is still "
            "shown next to each hero on the Stats page for that context.\n\n"
            "Filter by rank to see how the list shifts — win rates (and therefore tiers) "
            "can move meaningfully between, say, Initiate and Ascendant as hero "
            "difficulty and matchup knowledge change what 'strong' means at each level."
        ),
    ),
    BlogPost(
        slug="why-mock-data-first",
        title="Why SoulCurve launched on mock data",
        date="2026-09-14",
        author="SoulCurve Team",
        excerpt=(
            "Every number on the site today is deterministic mock data. Here's why, "
            "and what changes when the real model lands."
        ),
        body=(
            "If you've poked around SoulCurve, you've probably noticed a pattern: hero "
            "win rates, item stats, match histories, even the win-probability curve on "
            "a match page — none of it is live Deadlock data yet. It's all fixed or "
            "seeded mock data, deterministic per input so it looks plausible and stays "
            "stable across reloads.\n\n"
            "That's a deliberate build order, not a shortcut. Building the full product "
            "shape first — every page, every endpoint, a stable API contract — against "
            "mock data lets the frontend and backend move independently of the model "
            "training pipeline, which is its own project (see soulcurve-model) with its "
            "own timeline.\n\n"
            "When the real model and live deadlock-api integration land, the response "
            "shapes won't change — only where the numbers come from. Until then, "
            "consider everything you see a preview of the shape of the product, not "
            "the substance."
        ),
    ),
]


@router.get("/api/blog")
def blog_list() -> BlogListResponse:
    return BlogListResponse(
        posts=[BlogPostSummary(**post.model_dump(exclude={"body"})) for post in _MOCK_POSTS]
    )


@router.get("/api/blog/{slug}")
def blog_post(slug: str) -> BlogPost:
    post = next((p for p in _MOCK_POSTS if p.slug == slug), None)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
