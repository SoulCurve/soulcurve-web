import { useState } from "react";
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
import { fetchMatchAnalysis, fetchWinProbability } from "@/api";
import type { PlayerMoment, WinProbabilityResponse } from "@/api";
import { CHART, axisProps, interpolate, percent } from "@/chartTheme";
import ChartTooltip from "@/components/ChartTooltip";
import GameIcon from "@/components/GameIcon";
import MatchHeader from "@/components/site/MatchHeader";
import { Delta, ErrorState, LoadingState, PageShell, Section, Stat } from "@/components/site/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

const MOMENT_LABELS: Record<string, string> = {
  death: "Death",
  objective_loss: "Objective lost",
  objective_win: "Objective won",
  good_trade: "Good trade",
  rotation: "Rotation",
};

function ScoreDial({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(10, score)) / 10) * c;
  return (
    <svg viewBox="0 0 128 128" className="size-36" role="img" aria-label={`Score ${score.toFixed(1)} out of 10`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="var(--soul)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        transform="rotate(-90 64 64)"
      />
      <text x="64" y="70" textAnchor="middle" className="fill-foreground font-mono text-[28px] font-medium">
        {score.toFixed(1)}
      </text>
      <text x="64" y="88" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] tracking-[0.2em]">
        OUT OF 10
      </text>
    </svg>
  );
}

// Triangles point the way the play moved the curve, so good vs. bad reads without color.
function MomentMarker({ cx = 0, cy = 0, bad, active }: { cx?: number; cy?: number; bad: boolean; active: boolean }) {
  const s = active ? 9 : 7;
  const d = bad
    ? `M${cx - s} ${cy - s * 0.6} L${cx + s} ${cy - s * 0.6} L${cx} ${cy + s * 0.9} Z`
    : `M${cx - s} ${cy + s * 0.6} L${cx + s} ${cy + s * 0.6} L${cx} ${cy - s * 0.9} Z`;
  return <path d={d} fill={bad ? "var(--bad)" : "var(--good)"} stroke={CHART.surface} strokeWidth={2} />;
}

function MomentChart({
  wp,
  moments,
  active,
  onActive,
}: {
  wp: WinProbabilityResponse;
  moments: PlayerMoment[];
  active: number | null;
  onActive: (index: number | null) => void;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={wp.points} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="analysis-wp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={CHART.mark} stopOpacity={0.2} />
              <stop offset="1" stopColor={CHART.mark} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="t_min" type="number" domain={["dataMin", "dataMax"]} unit="m" {...axisProps} />
          <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} tickFormatter={percent} {...axisProps} axisLine={false} />
          <ReferenceLine y={0.5} stroke={CHART.reference} strokeDasharray="3 3" />
          {active !== null && (
            <ReferenceLine x={moments[active].t_min} stroke={CHART.reference} strokeDasharray="3 3" />
          )}
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
            content={({ active: hovering, payload, label }) =>
              hovering && payload?.length ? (
                <ChartTooltip>
                  <span className="font-mono tabular-nums">{label}m</span> ·{" "}
                  <span className="font-mono text-foreground tabular-nums">{percent(Number(payload[0].value))}</span> to
                  win
                </ChartTooltip>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="p_win"
            stroke={CHART.mark}
            strokeWidth={2}
            fill="url(#analysis-wp)"
            activeDot={{ r: 4, stroke: CHART.surface, strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {moments.map((moment, i) => (
            <ReferenceDot
              key={`${moment.t_min}-${moment.description}`}
              x={moment.t_min}
              y={interpolate(wp.points, moment.t_min)}
              shape={(props: { cx?: number; cy?: number }) => (
                <g onMouseEnter={() => onActive(i)} onMouseLeave={() => onActive(null)}>
                  <MomentMarker cx={props.cx} cy={props.cy} bad={moment.wpa_delta < 0} active={active === i} />
                </g>
              )}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AnalysisPage() {
  const { matchId = "" } = useParams<{ matchId: string }>();
  const { data, error } = useAsync(() => fetchMatchAnalysis(matchId), `analysis-${matchId}`);
  const wp = useAsync(() => fetchWinProbability(matchId), `wp-${matchId}`);
  const [active, setActive] = useState<number | null>(null);

  const mistakes = data?.moments.filter((m) => m.wpa_delta < 0) ?? [];
  const goodPlays = data?.moments.filter((m) => m.wpa_delta > 0) ?? [];
  const lost = mistakes.reduce((sum, m) => sum + m.wpa_delta, 0);
  const gained = goodPlays.reduce((sum, m) => sum + m.wpa_delta, 0);

  return (
    <PageShell>
      <MatchHeader matchId={matchId} />

      {error && <ErrorState message={`${error}. Check the match ID and try again.`} />}
      {!data && !error && <LoadingState label="Analyzing match…" />}

      {data && (
        <>
          <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
            <section className="deco-frame flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center">
              <span className="eyebrow">Match Score</span>
              <ScoreDial score={data.score} />
              <span className="flex items-center gap-2 text-sm">
                <GameIcon name={data.hero_name} kind="hero" />
                {data.hero_name}
              </span>
              <p className="text-sm text-pretty text-muted-foreground">{data.summary}</p>
            </section>

            <Section title="Win Probability" description="Your team’s chance to win · triangles mark your key moments">
              {wp.data ? (
                <MomentChart wp={wp.data} moments={data.moments} active={active} onActive={setActive} />
              ) : (
                <Skeleton className="h-64" />
              )}
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-good" aria-hidden="true">
                    ▲
                  </span>{" "}
                  Good play
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-bad" aria-hidden="true">
                    ▼
                  </span>{" "}
                  Mistake
                </span>
              </p>
            </Section>
          </div>

          <Section title="Key Moments" description="How each play moved your team’s win probability">
            <ol className="flex flex-col divide-y">
              {data.moments.map((moment, i) => {
                const bad = moment.wpa_delta < 0;
                return (
                  <li
                    key={`${moment.t_min}-${moment.description}`}
                    tabIndex={0}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "-mx-2 grid grid-cols-[3rem_1fr_auto] items-start gap-3 rounded-md px-2 py-3.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-soul/50",
                      active === i && "bg-white/[0.03]",
                    )}
                  >
                    <span className="pt-0.5 font-mono text-sm text-muted-foreground tabular-nums">{moment.t_min}m</span>
                    <span className="flex flex-col gap-1">
                      <span className="text-sm">{moment.description}</span>
                      <span className="text-xs text-muted-foreground">
                        <span className={bad ? "text-bad" : "text-good"}>{bad ? "▼ Mistake" : "▲ Good play"}</span>
                        {" · "}
                        {MOMENT_LABELS[moment.type] ?? moment.type}
                      </span>
                    </span>
                    <Delta value={moment.wpa_delta} className="pt-0.5" />
                  </li>
                );
              })}
            </ol>
          </Section>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Mistakes" value={mistakes.length} />
            <Stat label="Lost to Mistakes" value={<Delta value={lost} className="text-2xl" />} />
            <Stat label="Good Plays" value={goodPlays.length} />
            <Stat label="Gained" value={<Delta value={gained} className="text-2xl" />} />
          </div>
        </>
      )}
    </PageShell>
  );
}

export default AnalysisPage;
