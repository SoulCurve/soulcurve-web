import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { fetchPlayerMatches } from "@/api";
import GameIcon from "@/components/GameIcon";
import { ErrorState, LoadingState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

function PlayerPage() {
  const { steamId = "" } = useParams<{ steamId: string }>();
  const matches = useAsync(() => fetchPlayerMatches(steamId), `player-matches-${steamId}`);

  return (
    <PageShell>
      <Link
        to="/"
        className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        New Search
      </Link>
      <PageHeader title={<span translate="no">Player {steamId}</span>} />

      {matches.error && <ErrorState message={`${matches.error}. Check the Steam ID and try again.`} />}

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
