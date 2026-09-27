import { useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchWinProbability } from "@/api";
import { CHART, axisProps, percent } from "@/chartTheme";
import ChartTooltip from "@/components/ChartTooltip";
import MatchHeader from "@/components/site/MatchHeader";
import { ErrorState, LoadingState, PageShell, Section, Stat, TeamLabel } from "@/components/site/primitives";
import { useAsync } from "@/lib/useAsync";

function interpolate(points: { t_min: number; p_win: number }[], t: number) {
  const after = points.findIndex((p) => p.t_min >= t);
  if (after <= 0) return points[Math.max(after, 0)].p_win;
  const a = points[after - 1];
  const b = points[after];
  return a.p_win + ((t - a.t_min) / (b.t_min - a.t_min)) * (b.p_win - a.p_win);
}

function MatchPage() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const { data, error } = useAsync(() => fetchWinProbability(matchId), `wp-${matchId}`);

  const pWins = data?.points.map((p) => p.p_win) ?? [];
  const last = data?.points[data.points.length - 1];

  return (
    <PageShell>
      <MatchHeader matchId={matchId} />

      {error && <ErrorState message={`${error}. Check the match ID and try again.`} />}
      {!data && !error && <LoadingState label="Loading match…" />}

      {data && last && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Winner" value={<TeamLabel team={data.winner} />} />
            <Stat label="Duration" value={`${Math.round(last.t_min)} min`} />
            <Stat label="Lowest" value={percent(Math.min(...pWins))} hint={`${data.team_perspective} win chance`} />
            <Stat label="Highest" value={percent(Math.max(...pWins))} hint={`${data.team_perspective} win chance`} />
          </div>

          <Section
            title="Win Probability"
            description={`${data.team_perspective[0].toUpperCase()}${data.team_perspective.slice(1)} team’s chance to win · model ${data.model_version}`}
          >
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={data.points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="wp-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={CHART.mark} stopOpacity={0.22} />
                      <stop offset="1" stopColor={CHART.mark} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="t_min" type="number" domain={["dataMin", "dataMax"]} unit="m" {...axisProps} />
                  <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={percent} {...axisProps} axisLine={false} />
                  <ReferenceLine y={0.5} stroke={CHART.reference} strokeDasharray="3 3" />
                  {data.events.map((event) => (
                    <ReferenceDot
                      key={`${event.t_min}-${event.detail}-${event.team}`}
                      x={event.t_min}
                      y={interpolate(data.points, event.t_min)}
                      r={4}
                      fill={event.team === "amber" ? "var(--amber)" : "var(--sapphire)"}
                      stroke={CHART.surface}
                      strokeWidth={2}
                    />
                  ))}
                  <Tooltip
                    cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <ChartTooltip>
                          <span className="font-mono tabular-nums">{label}m</span> ·{" "}
                          <span className="font-mono text-foreground tabular-nums">
                            {percent(Number(payload[0].value))}
                          </span>{" "}
                          to win
                        </ChartTooltip>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="p_win"
                    stroke={CHART.mark}
                    strokeWidth={2}
                    fill="url(#wp-fill)"
                    activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Dots mark objectives:</span>
              <TeamLabel team="amber" />
              <TeamLabel team="sapphire" />
            </p>
          </Section>

          <Section title="Objectives">
            <ol className="flex flex-col divide-y">
              {data.events.map((event) => (
                <li
                  key={`${event.t_min}-${event.detail}-${event.team}`}
                  className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <span className="font-mono text-muted-foreground tabular-nums">{event.t_min}m</span>
                  <span>{event.detail}</span>
                  <span className="text-muted-foreground">
                    <TeamLabel team={event.team} />
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        </>
      )}
    </PageShell>
  );
}

export default MatchPage;
