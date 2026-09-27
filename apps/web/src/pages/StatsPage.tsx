import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { fetchHeroItemStats, fetchHeroStats, fetchRanks } from "@/api";
import type { HeroStat, ItemStat } from "@/api";
import { percent } from "@/chartTheme";
import GameIcon from "@/components/GameIcon";
import { ErrorState, LoadingState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AssetKind } from "@/lib/gameAssets";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

// Bars grow from 50% so a few points of edge stay visible without truncating the scale.
function WinRateBar({ rate }: { rate: number }) {
  const edge = Math.max(-0.1, Math.min(0.1, rate - 0.5));
  const width = `${(Math.abs(edge) / 0.1) * 50}%`;
  return (
    <div className="flex items-center justify-end gap-3">
      <span
        className={cn(
          "w-12 text-right font-mono tabular-nums",
          edge >= 0 ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {percent(rate)}
      </span>
      <div className="relative hidden h-1.5 w-20 rounded-full bg-white/[0.04] sm:block" aria-hidden="true">
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-white/20" />
        <span
          className={cn("absolute inset-y-0 rounded-full", edge >= 0 ? "left-1/2 bg-soul" : "right-1/2 bg-white/25")}
          style={{ width }}
        />
      </div>
    </div>
  );
}

type SortKey = "name" | "win_rate" | "pick_rate";
type Sort = { key: SortKey; desc: boolean };

function SortHeader({
  label,
  short,
  column,
  sort,
  onSort,
  className,
}: {
  label: string;
  short?: string;
  column: SortKey;
  sort: Sort;
  onSort: (sort: Sort) => void;
  className?: string;
}) {
  const active = sort.key === column;
  const Icon = !active ? ChevronsUpDown : sort.desc ? ChevronDown : ChevronUp;
  return (
    <TableHead className={className} aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}>
      <button
        type="button"
        onClick={() => onSort({ key: column, desc: active ? !sort.desc : column !== "name" })}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {short ? (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
        <Icon className={cn("size-3.5", !active && "hidden sm:block")} aria-hidden="true" />
      </button>
    </TableHead>
  );
}

function RateTable<T extends HeroStat | ItemStat>({
  rows,
  kind,
  getKey,
  selectedKey,
  onSelect,
}: {
  rows: T[];
  kind: AssetKind;
  getKey: (row: T) => number;
  selectedKey?: number | null;
  onSelect?: (row: T) => void;
}) {
  const [sort, setSort] = useState<Sort>({ key: "win_rate", desc: true });
  const sorted = [...rows].sort((a, b) => {
    const order = sort.key === "name" ? a.name.localeCompare(b.name) : a[sort.key] - b[sort.key];
    return sort.desc ? -order : order;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="hidden w-10 sm:table-cell">#</TableHead>
          <SortHeader label={kind === "hero" ? "Hero" : "Item"} column="name" sort={sort} onSort={setSort} />
          <SortHeader label="Win Rate" short="Win" column="win_rate" sort={sort} onSort={setSort} className="text-right" />
          <SortHeader label="Pick Rate" short="Pick" column="pick_rate" sort={sort} onSort={setSort} className="text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
              No matches.
            </TableCell>
          </TableRow>
        )}
        {sorted.map((row, i) => {
          const key = getKey(row);
          const selected = selectedKey === key;
          return (
            <TableRow
              key={key}
              data-state={selected ? "selected" : undefined}
              className={cn(onSelect && "cursor-pointer", selected && "bg-soul-dim hover:bg-soul-dim")}
              onClick={onSelect ? () => onSelect(row) : undefined}
            >
              <TableCell className="hidden font-mono text-muted-foreground tabular-nums sm:table-cell">
                {i + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <GameIcon name={row.name} kind={kind} />
                  {onSelect ? (
                    <button
                      type="button"
                      className="text-left hover:text-soul"
                      aria-pressed={selected}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(row);
                      }}
                    >
                      {row.name}
                    </button>
                  ) : (
                    row.name
                  )}
                </div>
              </TableCell>
              <TableCell>
                <WinRateBar rate={row.win_rate} />
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
                {percent(row.pick_rate)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function RankSelect({ value, onChange }: { value: string; onChange: (rank: string) => void }) {
  const ranks = useAsync(fetchRanks, "ranks");
  return (
    <div className="relative">
      <select
        aria-label="Filter by rank"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full cursor-pointer appearance-none rounded-md border bg-card py-1.5 pr-8 pl-3 text-sm outline-none focus-visible:border-soul/60 sm:w-40"
      >
        <option value="">All Ranks</option>
        {ranks.data?.map((rank) => (
          <option key={rank} value={rank}>
            {rank}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

function StatsPage() {
  const [params, setParams] = useSearchParams();
  const heroParam = params.get("hero");
  const query = params.get("q") ?? "";
  const rank = params.get("rank") ?? "";
  const heroes = useAsync(() => fetchHeroStats(rank || null), `heroes-${rank}`);
  const selectedHero = heroParam
    ? Number(heroParam)
    : heroes.data
      ? [...heroes.data.heroes].sort((a, b) => b.win_rate - a.win_rate)[0]?.hero_id
      : null;
  const items = useAsync(
    () => (selectedHero ? fetchHeroItemStats(selectedHero) : Promise.resolve(null)),
    `items-${selectedHero}`,
  );

  return (
    <PageShell>
      <PageHeader
        title="Heroes & Items"
        description={`Win and pick rates for ${heroes.data ? `patch ${heroes.data.patch}` : "the current patch"}${rank ? ` · ${rank} rank` : ""}. Select a hero to see which items win games on it.`}
      />

      {heroes.error && <ErrorState message={`${heroes.error}. Refresh to try again.`} />}
      {!heroes.data && !heroes.error && <LoadingState label="Loading stats…" variant="rows" />}

      {heroes.data && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Heroes" description="Click a column to sort · bars show distance from 50%">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 sm:max-w-64">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  aria-label="Filter heroes"
                  placeholder="Filter heroes…"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => {
                    const next = new URLSearchParams(params);
                    if (e.target.value) next.set("q", e.target.value);
                    else next.delete("q");
                    setParams(next, { replace: true });
                  }}
                  className="pl-8"
                />
              </div>
              <RankSelect
                value={rank}
                onChange={(next) => {
                  const nextParams = new URLSearchParams(params);
                  if (next) nextParams.set("rank", next);
                  else nextParams.delete("rank");
                  setParams(nextParams, { replace: true });
                }}
              />
            </div>
            <RateTable
              rows={heroes.data.heroes.filter((h) => h.name.toLowerCase().includes(query.trim().toLowerCase()))}
              kind="hero"
              getKey={(h) => h.hero_id}
              selectedKey={selectedHero}
              onSelect={(h) => {
                const next = new URLSearchParams(params);
                next.set("hero", String(h.hero_id));
                setParams(next, { replace: true });
              }}
            />
          </Section>

          <Section
            title={items.data ? `${items.data.hero_name} · Items` : "Items"}
            description="Win rate in games where the item was bought"
            className="lg:self-start"
          >
            {items.error && <ErrorState message={items.error} />}
            {!items.data && !items.error && <LoadingState label="Loading items…" variant="rows" />}
            {items.data && <RateTable rows={items.data.items} kind="item" getKey={(it) => it.item_id} />}
          </Section>
        </div>
      )}
    </PageShell>
  );
}

export default StatsPage;
