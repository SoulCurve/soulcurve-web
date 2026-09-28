import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { fetchTournament } from "@/api";
import type { TournamentMatch } from "@/api";
import { usd } from "@/chartTheme";
import TournamentStatusBadge from "@/components/site/TournamentStatusBadge";
import { ErrorState, LoadingState, PageHeader, PageShell, Section, Stat } from "@/components/site/primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

function MatchRow({ match }: { match: TournamentMatch }) {
  const played = match.score_a !== null && match.score_b !== null;
  const aWon = played && match.score_a! > match.score_b!;
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 text-sm first:pt-0 last:pb-0">
      <span className={cn("truncate text-right", played && !aWon && "text-muted-foreground")}>{match.team_a}</span>
      <span className="w-16 text-center font-mono tabular-nums">
        {played ? (
          `${match.score_a} – ${match.score_b}`
        ) : (
          <span className="text-xs text-muted-foreground">{match.date.slice(5)}</span>
        )}
      </span>
      <span className={cn("truncate", played && aWon && "text-muted-foreground")}>{match.team_b}</span>
    </li>
  );
}

function TournamentPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, error } = useAsync(() => fetchTournament(slug), `tournament-${slug}`);
  const rounds = data ? [...new Set(data.matches.map((m) => m.round))] : [];
  const played = data?.matches.filter((m) => m.score_a !== null).length ?? 0;

  return (
    <PageShell>
      <Link
        to="/tournaments"
        className="-ml-1 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All Tournaments
      </Link>
      {error && <ErrorState message={`${error}. Check the link and try again.`} />}
      {!data && !error && <LoadingState label="Loading tournament…" />}

      {data && (
        <>
          <PageHeader
            title={data.name}
            description={`${data.organizer} · ${data.start_date} → ${data.end_date}`}
            actions={<TournamentStatusBadge status={data.status} />}
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Prize Pool" value={usd(data.prize_pool_usd)} />
            <Stat label="Teams" value={data.team_count} />
            <Stat label="Series Played" value={`${played} / ${data.matches.length}`} />
            <Stat
              label={data.status === "completed" ? "Champion" : "Leader"}
              value={played ? data.standings[0].team : "TBD"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
            <Section title="Standings" description="Series wins and losses" className="lg:self-start">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">W–L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.standings.map((row) => (
                    <TableRow key={row.team} className={cn(row.rank === 1 && played > 0 && "bg-soul-dim")}>
                      <TableCell className="font-mono text-muted-foreground tabular-nums">{row.rank}</TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {row.wins}–{row.losses}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Section title="Schedule & Results" description="Best-of-three series">
              <div className="flex flex-col gap-6">
                {rounds.map((round) => (
                  <div key={round} className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{round}</h3>
                    <ol className="flex flex-col divide-y">
                      {data.matches
                        .filter((m) => m.round === round)
                        .map((match) => (
                          <MatchRow key={match.id} match={match} />
                        ))}
                    </ol>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </>
      )}
    </PageShell>
  );
}

export default TournamentPage;
