import { Link, useParams } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, UserCheck, UserPlus } from "lucide-react";
import { fetchPlayerMatches, fetchPlayerProfile } from "@/api";
import type { MatchSummary } from "@/api";
import { percent } from "@/chartTheme";
import GameIcon from "@/components/GameIcon";
import { ErrorState, LoadingState, PageHeader, PageShell, Section, Stat } from "@/components/site/primitives";
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
  const profile = useAsync(() => fetchPlayerProfile(steamId), `player-profile-${steamId}`);
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

      {profile.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Stat
              label="Skill Rating"
              value={profile.data.skill_rating.toLocaleString("en-US")}
              hint={`Top ${Math.max(1, Math.ceil((1 - profile.data.skill_percentile) * 100))}% · estimate`}
            />
            {profile.data.grades.map((grade) => (
              <Stat
                key={grade.category}
                label={grade.category}
                value={grade.letter}
                hint={`${Math.round(grade.score * 100)} / 100`}
              />
            ))}
          </div>

          {profile.data.tendencies.length > 0 && (
            <Section title="Tendencies" description="Picked from this player's strongest and weakest graded area">
              <ul className="grid gap-3 sm:grid-cols-2">
                {profile.data.tendencies.map((tendency) => {
                  const strength = tendency.tone === "strength";
                  const Icon = strength ? ArrowUpRight : ArrowDownRight;
                  return (
                    <li key={tendency.label} className="flex gap-3 rounded-lg border bg-card px-4 py-3">
                      <Icon
                        className={cn("mt-0.5 size-4 shrink-0", strength ? "text-good" : "text-bad")}
                        aria-hidden="true"
                      />
                      <span className="flex flex-col gap-0.5 text-sm">
                        <span>
                          <span className={cn("mr-2 text-xs", strength ? "text-good" : "text-bad")}>
                            {strength ? "Strength" : "Weakness"}
                          </span>
                          {tendency.label}
                        </span>
                        <span className="text-muted-foreground">{tendency.detail}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}
        </>
      )}

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
