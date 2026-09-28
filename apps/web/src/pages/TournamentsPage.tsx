import { Link } from "react-router-dom";
import { fetchTournaments } from "@/api";
import type { TournamentSummary } from "@/api";
import { ErrorState, LoadingState, PageHeader, PageShell } from "@/components/site/primitives";
import TournamentStatusBadge from "@/components/site/TournamentStatusBadge";
import { usd } from "@/chartTheme";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

const STATUS_ORDER: Record<TournamentSummary["status"], number> = { live: 0, upcoming: 1, completed: 2 };

function TournamentsPage() {
  const { data, error } = useAsync(fetchTournaments, "tournaments");
  const events = data ? [...data.tournaments].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) : [];

  return (
    <PageShell>
      <PageHeader
        title="Tournaments"
        description="Leagues and events, with standings and results. Sample data until a pro-match source is connected."
      />
      {error && <ErrorState message={`${error}. Refresh to try again.`} />}
      {!data && !error && <LoadingState label="Loading tournaments…" variant="list" />}

      <ol className="grid gap-4 md:grid-cols-3">
        {events.map((event) => (
          <li key={event.slug}>
            <Link
              to={`/tournaments/${event.slug}`}
              className={cn(
                "deco-frame flex h-full flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-soul/50",
                event.status === "completed" && "opacity-80",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <TournamentStatusBadge status={event.status} />
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {event.start_date} → {event.end_date}
                </span>
              </div>
              <h2 className="text-lg font-medium text-balance">{event.name}</h2>
              <dl className="mt-auto grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Prize pool</dt>
                  <dd className="font-mono tabular-nums">{usd(event.prize_pool_usd)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Teams</dt>
                  <dd className="font-mono tabular-nums">{event.team_count}</dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}

export default TournamentsPage;
