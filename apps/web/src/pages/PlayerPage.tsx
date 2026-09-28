import { Link, useParams } from "react-router-dom";
import { ChevronLeft, UserCheck, UserPlus } from "lucide-react";
import { fetchPlayerMatches } from "@/api";
import type { MatchSummary } from "@/api";
import { percent } from "@/chartTheme";
import GameIcon from "@/components/GameIcon";
import { ErrorState, LoadingState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { useFollowing } from "@/lib/following";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

interface HeroPoolEntry {
  hero_id: number;
  hero_name: string;
  games: number;
  wins: number;
}

function heroPool(matches: MatchSummary[]): HeroPoolEntry[] {
  const byHero = new Map<number, HeroPoolEntry>();
  for (const match of matches) {
    const entry = byHero.get(match.hero_id) ?? {
      hero_id: match.hero_id,
      hero_name: match.hero_name,
      games: 0,
      wins: 0,
    };
    entry.games += 1;
    entry.wins += match.result === "win" ? 1 : 0;
    byHero.set(match.hero_id, entry);
  }
  return [...byHero.values()].sort((a, b) => b.games - a.games);
}

function PlayerPage() {
  const { steamId = "" } = useParams<{ steamId: string }>();
  const matches = useAsync(() => fetchPlayerMatches(steamId), `player-matches-${steamId}`);
  const pool = matches.data ? heroPool(matches.data.matches) : [];
  const following = useFollowing();
  const followed = following.isFollowing(steamId);

  return (
    <PageShell>
      <Link
        to="/"
        className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        New Search
      </Link>
      <PageHeader
        title={<span translate="no">{matches.data?.name ?? `Player ${steamId}`}</span>}
        actions={
          <Button
            variant={followed ? "outline" : "default"}
            onClick={() => following.toggle(steamId)}
            aria-pressed={followed}
          >
            {followed ? <UserCheck /> : <UserPlus />}
            {followed ? "Following" : "Follow"}
          </Button>
        }
      />

      {matches.error && <ErrorState message={`${matches.error}. Check the Steam ID and try again.`} />}

      {pool.length > 0 && (
        <Section title="Hero Pool" description="Heroes played in the last 10 matches">
          <ul className="flex flex-wrap gap-3">
            {pool.map((entry) => (
              <li
                key={entry.hero_id}
                className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <GameIcon name={entry.hero_name} kind="hero" />
                <span className="flex flex-col">
                  <span>{entry.hero_name}</span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {entry.games} {entry.games === 1 ? "game" : "games"} · {percent(entry.wins / entry.games)} WR
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Recent Matches">
        {!matches.data && !matches.error && <LoadingState label="Loading match history…" variant="rows" />}
        {matches.data && (
          <ol className="flex flex-col divide-y">
            {matches.data.matches.map((match) => (
              <li key={match.match_id}>
                <Link
                  to={`/match/${match.match_id}/analysis`}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3 text-sm first:pt-0 last:pb-0 hover:text-soul"
                >
                  <span
                    aria-hidden="true"
                    className={cn("h-8 w-1 rounded-full", match.result === "win" ? "bg-good" : "bg-bad")}
                  />
                  <span className="flex items-center gap-2.5">
                    <GameIcon name={match.hero_name} kind="hero" />
                    <span className="flex flex-col">
                      <span>{match.hero_name}</span>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">{match.played_at}</span>
                    </span>
                  </span>
                  <span className="hidden font-mono text-xs text-muted-foreground tabular-nums sm:inline">
                    {match.kills}/{match.deaths}/{match.assists}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs font-medium tabular-nums capitalize",
                      match.result === "win" ? "text-good" : "text-bad",
                    )}
                  >
                    {match.result}
                    <span className="ml-2 text-muted-foreground">{match.duration_min}m</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </PageShell>
  );
}

export default PlayerPage;
