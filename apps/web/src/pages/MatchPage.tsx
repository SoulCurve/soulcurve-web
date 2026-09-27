import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchWinProbability } from "../api";
import type { WinProbabilityResponse } from "../api";
import { CHART, axisProps, percent } from "../chartTheme";
import Panel from "../components/Panel";
import StatTile from "../components/StatTile";

function TeamName({ team }: { team: string }) {
  return (
    <>
      <span className={`team-dot team-${team}`} />
      <span style={{ textTransform: "capitalize" }}>{team}</span>
    </>
  );
}

function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [data, setData] = useState<WinProbabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    fetchWinProbability(matchId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const pWins = data?.points.map((p) => p.p_win) ?? [];
  const lowest = pWins.length ? Math.min(...pWins) : 0;
  const highest = pWins.length ? Math.max(...pWins) : 0;

  return (
    <main>
      <Link to="/" className="back-link">
        &larr; New search
      </Link>
      <div className="page-head">
        <span className="eyebrow">Match</span>
        <h1>#{matchId}</h1>
      </div>

      {error && <p role="alert">{error}</p>}
      {!data && !error && <p className="state-text">Loading match…</p>}

      {data && (
        <>
          <div className="grid grid-3">
            <StatTile label="Winner" value={<TeamName team={data.winner} />} />
            <StatTile label="Lowest point" value={percent(lowest)} />
            <StatTile label="Highest point" value={percent(highest)} />
          </div>

          <Panel
            title="Win probability"
            subtitle={`From the ${data.team_perspective} team's side · model ${data.model_version}`}
            action={
              <Link to={`/match/${matchId}/analysis`} className="button button-primary">
                Analyze my play
              </Link>
            }
          >
            <div className="chart-box">
              <ResponsiveContainer>
                <AreaChart data={data.points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="wp-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={CHART.accent} stopOpacity={0.35} />
                      <stop offset="1" stopColor={CHART.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="t_min"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    unit="m"
                    {...axisProps}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={percent} {...axisProps} axisLine={false} />
                  <ReferenceLine y={0.5} stroke={CHART.reference} strokeDasharray="4 4" />
                  <Tooltip
                    cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="chart-tooltip">
                          {label} min · <strong>{percent(Number(payload[0].value))}</strong> to
                          win
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="p_win"
                    stroke={CHART.accent}
                    strokeWidth={2}
                    fill="url(#wp-fill)"
                    activeDot={{ r: 5, stroke: "#12151c", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Objectives">
            <ul className="timeline">
              {data.events.map((event) => (
                <li key={`${event.t_min}-${event.detail}-${event.team}`}>
                  <span className="timeline-time">{event.t_min}m</span>
                  <span className="timeline-body">
                    <strong>{event.detail}</strong>
                    <span style={{ textTransform: "capitalize" }}>{event.type}</span>
                  </span>
                  <span className="stat-value" style={{ fontSize: 13, fontWeight: 500 }}>
                    <TeamName team={event.team} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </main>
  );
}

export default MatchPage;
