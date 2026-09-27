import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { fetchHeroItemStats, fetchHeroStats } from "../api";
import type { HeroItemStatsResponse, HeroStat, HeroStatsResponse } from "../api";

const winRateTick = (v: number) => `${Math.round(v * 100)}%`;
const winRateTooltip = (value: unknown) => `${Math.round(Number(value) * 100)}%`;

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
      <h1>Stats</h1>

      {error && <p role="alert">{error}</p>}
      {!heroStats && !error && <p>Loading...</p>}

      {heroStats && (
        <>
          <p>
            Hero win rates &middot; patch <code>{heroStats.patch}</code>
          </p>
          <BarChart
            width={640}
            height={320}
            data={heroStats.heroes}
            margin={{ top: 16, right: 16, bottom: 16, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} tickFormatter={winRateTick} />
            <Tooltip formatter={winRateTooltip} />
            <Bar
              dataKey="win_rate"
              fill="var(--accent)"
              isAnimationActive={false}
              onClick={(data: { payload?: HeroStat }) => {
                if (data.payload) setSelectedHero(data.payload.hero_id);
              }}
              cursor="pointer"
            />
          </BarChart>
          <p>Click a bar to see the most popular items for that hero.</p>
        </>
      )}

      {selectedHero !== null && (
        <>
          {itemError && <p role="alert">{itemError}</p>}
          {!itemStats && !itemError && <p>Loading...</p>}
          {itemStats && (
            <>
              <h2>{itemStats.hero_name} — popular items</h2>
              <BarChart
                width={640}
                height={320}
                data={itemStats.items}
                margin={{ top: 16, right: 16, bottom: 16, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} tickFormatter={winRateTick} />
                <Tooltip formatter={winRateTooltip} />
                <Bar dataKey="win_rate" fill="var(--accent)" isAnimationActive={false} />
              </BarChart>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default StatsPage;
