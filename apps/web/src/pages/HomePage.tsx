import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { fetchHeroStats, fetchMatchAnalysis, fetchNews, fetchWinProbability, steamLoginUrl } from "@/api";
import { CHART, percent } from "@/chartTheme";
import { PageShell, Section } from "@/components/site/primitives";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsync } from "@/lib/useAsync";
import { useSteamId } from "@/lib/useSteamId";
import { cn } from "@/lib/utils";

const SAMPLE_MATCH = "1";

function SampleMatch() {
  const wp = useAsync(() => fetchWinProbability(SAMPLE_MATCH), `wp-${SAMPLE_MATCH}`);
  const analysis = useAsync(() => fetchMatchAnalysis(SAMPLE_MATCH), `analysis-${SAMPLE_MATCH}`);

  return (
    <Link
      to={`/match/${SAMPLE_MATCH}/analysis`}
      className="deco-frame group flex flex-col gap-4 rounded-lg border bg-card p-5 transition-colors hover:border-soul/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Sample match #{SAMPLE_MATCH}</span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <div className="h-28">
        {wp.data && (
          <ResponsiveContainer>
            <AreaChart data={wp.data.points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="home-wp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={CHART.mark} stopOpacity={0.25} />
                  <stop offset="1" stopColor={CHART.mark} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 1]} />
              <ReferenceLine y={0.5} stroke={CHART.reference} strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="p_win"
                stroke={CHART.mark}
                strokeWidth={2}
                fill="url(#home-wp)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 border-t pt-4">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Score</span>
          <span className="font-mono text-lg tabular-nums">
            {analysis.data ? analysis.data.score.toFixed(1) : "–"}
            <span className="text-muted-foreground">/10</span>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Hero</span>
          <span className="text-lg">{analysis.data?.hero_name ?? "–"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="eyebrow">Final</span>
          <span className="font-mono text-lg tabular-nums">
            {wp.data ? percent(wp.data.points[wp.data.points.length - 1].p_win) : "–"}
          </span>
        </div>
      </div>
    </Link>
  );
}

const SEARCH_MODES = {
  match: { label: "Match", placeholder: "Match ID…" },
  player: { label: "Player", placeholder: "Steam ID or profile URL…" },
} as const;

type SearchMode = keyof typeof SEARCH_MODES;

// Accepts a bare ID or a steamcommunity.com/profiles/<id> URL.
function parseQuery(raw: string) {
  const trimmed = raw.trim();
  return trimmed.match(/profiles\/(\d+)/)?.[1] ?? trimmed;
}

function SearchBar() {
  const navigate = useNavigate();
  const [steamId] = useSteamId();
  const [mode, setMode] = useState<SearchMode>("match");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = parseQuery(String(new FormData(e.currentTarget).get("q") ?? ""));
    if (id) navigate(`/${mode}/${encodeURIComponent(id)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row">
      <div className="flex h-12 w-full flex-1 items-center rounded-lg border bg-card transition-colors focus-within:border-soul/60">
        <Search className="ml-4 size-4 shrink-0 text-soul" aria-hidden="true" />
        <label htmlFor="search-mode" className="sr-only">
          Search Type
        </label>
        <div className="relative">
          <select
            id="search-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as SearchMode)}
            className="h-12 cursor-pointer appearance-none bg-transparent pr-7 pl-2.5 text-sm font-semibold tracking-wider text-soul uppercase outline-none"
          >
            {Object.entries(SEARCH_MODES).map(([value, m]) => (
              <option key={value} value={value} className="bg-card text-foreground">
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-soul" aria-hidden="true" />
        </div>
        <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />
        <label htmlFor="search-q" className="sr-only">
          {mode === "match" ? "Match ID" : "Steam ID"}
        </label>
        <input
          id="search-q"
          name="q"
          autoComplete="off"
          spellCheck={false}
          placeholder={SEARCH_MODES[mode].placeholder}
          className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        <button
          type="submit"
          aria-label="Search"
          className="mr-1.5 grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      {typeof steamId !== "string" && (
        <>
          <span className="text-sm text-muted-foreground">or</span>
          <a href={steamLoginUrl()} className={cn(buttonVariants({ variant: "outline" }), "h-12 shrink-0 px-5")}>
            Sign In with Steam
          </a>
        </>
      )}
    </form>
  );
}

function HomePage() {
  const heroes = useAsync(fetchHeroStats, "heroes");
  const news = useAsync(fetchNews, "news");

  const topHeroes = heroes.data
    ? [...heroes.data.heroes].sort((a, b) => b.win_rate - a.win_rate).slice(0, 5)
    : [];

  return (
    <PageShell>
      <section className="flex flex-col items-center gap-5 py-8 text-center sm:py-14">
        <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
          Every match has a <span className="text-soul">turning point</span>.
        </h1>
        <p className="max-w-lg text-pretty text-muted-foreground">
          See how your team&rsquo;s win probability moved minute by minute, and which of your plays cost the most.
        </p>
        <div className="mt-3 flex w-full justify-center">
          <SearchBar />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <SampleMatch />
        <Section
          title="Top Heroes"
          description={heroes.data ? `Highest win rate · patch ${heroes.data.patch}` : undefined}
          action={
            <Link to="/stats" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-my-1")}>
              All Stats
            </Link>
          }
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">#</TableHead>
                <TableHead>Hero</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Pick Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topHeroes.map((hero, i) => (
                <TableRow key={hero.hero_id}>
                  <TableCell className="font-mono text-muted-foreground tabular-nums">{i + 1}</TableCell>
                  <TableCell>{hero.name}</TableCell>
                  <TableCell className={cn("text-right font-mono tabular-nums", hero.win_rate > 0.5 ? "text-soul" : "text-muted-foreground")}>
                    {percent(hero.win_rate)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                    {percent(hero.pick_rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section
          title="Latest"
          action={
            <Link to="/news" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-my-1")}>
              All News
            </Link>
          }
        >
          <ul className="flex flex-col divide-y">
            {news.data?.items.slice(0, 3).map((item) => (
              <li key={item.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{item.date}</span>
                <span className="text-sm">{item.title}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  );
}

export default HomePage;
