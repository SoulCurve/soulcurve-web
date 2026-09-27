import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { fetchHeroStats, fetchMatchAnalysis, fetchNews, fetchWinProbability } from "@/api";
import { CHART, percent } from "@/chartTheme";
import { PageShell, Section } from "@/components/site/primitives";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsync } from "@/lib/useAsync";
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
        <span className="eyebrow">Sample Match #{SAMPLE_MATCH}</span>
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

function HomePage() {
  const navigate = useNavigate();
  const heroes = useAsync(fetchHeroStats, "heroes");
  const news = useAsync(fetchNews, "news");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = String(new FormData(e.currentTarget).get("match") ?? "").trim();
    if (id) navigate(`/match/${id}`);
  }

  const topHeroes = heroes.data
    ? [...heroes.data.heroes].sort((a, b) => b.win_rate - a.win_rate).slice(0, 5)
    : [];

  return (
    <PageShell>
      <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_1fr] lg:py-12">
        <div className="flex flex-col gap-6">
          <span className="eyebrow">Deadlock Match Analytics</span>
          <h1 className="display text-5xl leading-[0.95] text-balance sm:text-7xl">
            Every match has a <span className="text-soul">turning point</span>.
          </h1>
          <p className="max-w-md text-pretty text-muted-foreground">
            See how your team&rsquo;s win probability moved minute by minute, and which of your
            plays cost the most.
          </p>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <label htmlFor="match" className="sr-only">
              Match ID
            </label>
            <Input
              id="match"
              name="match"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              placeholder="Match ID, e.g. 38421907…"
              className="h-10 text-base sm:text-sm"
            />
            <Button type="submit" className="h-10 px-4">
              Analyze
            </Button>
          </form>
        </div>
        <SampleMatch />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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
