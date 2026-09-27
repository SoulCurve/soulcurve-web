import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps, TooltipValueType } from "recharts";
import { fetchHeroItemStats, fetchHeroStats } from "../api";
import type { HeroItemStatsResponse, HeroStat, HeroStatsResponse, ItemStat } from "../api";
import { CHART, axisProps, percent } from "../chartTheme";

// Bars grow from the 50% line so small win-rate edges stay visible without truncating the axis.
const withEdge = <T extends { win_rate: number }>(rows: T[]) =>
  rows.map((row) => ({ ...row, edge: row.win_rate - 0.5 }));
const edgeTick = (v: number) => percent(v + 0.5);
const EDGE_DOMAIN: [number, number] = [-0.1, 0.1];
import Panel from "../components/Panel";

function RateTooltip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  const row = payload?.[0]?.payload as HeroStat | ItemStat | undefined;
  if (!active || !row) return null;
  return (
    <div className="chart-tooltip">
      <strong>{row.name}</strong>
      <br />
      Win rate <strong>{percent(row.win_rate)}</strong> · Pick rate {percent(row.pick_rate)}
    </div>
  );
}

function StatsPage() {
  const [heroStats, setHeroStats] = useState<HeroStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHero, setSelectedHero] = useState<number | null>(null);
  const [itemStats, setItemStats] = useState<HeroItemStatsResponse | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHeroStats()
      .then((res) => {
        if (!cancelled) setHeroStats(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedHero === null) return;
    let cancelled = false;
    fetchHeroItemStats(selectedHero)
      .then((res) => {
        if (cancelled) return;
        setItemStats(res);
        setItemError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setItemStats(null);
        setItemError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedHero]);

  return (
    <main>
      <div className="page-head">
        <span className="eyebrow">Stats{heroStats && ` · patch ${heroStats.patch}`}</span>
        <h1>Heroes &amp; items</h1>
        <p>Hero win rates for the current patch. Pick a hero to see which items win games on it.</p>
      </div>

      {error && <p role="alert">{error}</p>}
      {!heroStats && !error && <p className="state-text">Loading stats…</p>}

      {heroStats && (
        <Panel title="Hero win rate" subtitle="Bars grow from a 50% win rate · click one to see that hero's items">
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={withEdge(heroStats.heroes)} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="name" {...axisProps} interval={0} axisLine={false} />
                <YAxis domain={EDGE_DOMAIN} tickFormatter={edgeTick} {...axisProps} axisLine={false} />
                <ReferenceLine y={0} stroke={CHART.reference} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={RateTooltip} />
                <Bar
                  dataKey="edge"
                  radius={4}
                  maxBarSize={44}
                  isAnimationActive={false}
                  cursor="pointer"
                  onClick={(data: { payload?: HeroStat }) => {
                    if (data.payload) setSelectedHero(data.payload.hero_id);
                  }}
                >
                  {heroStats.heroes.map((hero) => (
                    <Cell
                      key={hero.hero_id}
                      fill={CHART.accent}
                      fillOpacity={selectedHero === null || selectedHero === hero.hero_id ? 1 : 0.35}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      {selectedHero !== null && (
        <Panel
          title={itemStats ? `${itemStats.hero_name} · popular items` : "Popular items"}
          subtitle="Win rate of games where the item was bought"
        >
          {itemError && <p role="alert">{itemError}</p>}
          {!itemStats && !itemError && <p className="state-text">Loading items…</p>}
          {itemStats && (
            <div className="chart-box">
              <ResponsiveContainer>
                <BarChart data={withEdge(itemStats.items)} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" {...axisProps} interval={0} axisLine={false} />
                  <YAxis domain={EDGE_DOMAIN} tickFormatter={edgeTick} {...axisProps} axisLine={false} />
                  <ReferenceLine y={0} stroke={CHART.reference} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={RateTooltip} />
                  <Bar
                    dataKey="edge"
                    fill={CHART.accent}
                    radius={4}
                    maxBarSize={44}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      )}
    </main>
  );
}

export default StatsPage;
