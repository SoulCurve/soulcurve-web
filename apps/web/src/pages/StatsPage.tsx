import { useSearchParams } from "react-router-dom";
import { fetchHeroItemStats, fetchHeroStats } from "@/api";
import type { HeroStat, ItemStat } from "@/api";
import { percent } from "@/chartTheme";
import { ErrorState, LoadingState, PageHeader, PageShell, Section } from "@/components/site/primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

// Bars grow from 50% so a few points of edge stay visible without truncating the scale.
function WinRateBar({ rate }: { rate: number }) {
  const edge = Math.max(-0.1, Math.min(0.1, rate - 0.5));
  const width = `${(Math.abs(edge) / 0.1) * 50}%`;
  return (
    <div className="flex items-center justify-end gap-3">
      <span className={cn("w-12 text-right font-mono tabular-nums", edge >= 0 ? "text-foreground" : "text-muted-foreground")}>
        {percent(rate)}
      </span>
      <div className="relative hidden h-1.5 w-28 rounded-full bg-white/[0.04] sm:block" aria-hidden="true">
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-white/20" />
        <span
          className={cn("absolute inset-y-0 rounded-full", edge >= 0 ? "left-1/2 bg-soul" : "right-1/2 bg-white/25")}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function RateTable<T extends HeroStat | ItemStat>({
  rows,
  nameLabel,
  getKey,
  selectedKey,
  onSelect,
}: {
  rows: T[];
  nameLabel: string;
  getKey: (row: T) => number;
  selectedKey?: number | null;
  onSelect?: (row: T) => void;
}) {
  const sorted = [...rows].sort((a, b) => b.win_rate - a.win_rate);
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10">#</TableHead>
          <TableHead>{nameLabel}</TableHead>
          <TableHead className="text-right">Win Rate</TableHead>
          <TableHead className="w-24 text-right">Pick Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
              <TableCell className="font-mono text-muted-foreground tabular-nums">{i + 1}</TableCell>
              <TableCell>
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

function StatsPage() {
  const [params, setParams] = useSearchParams();
  const heroParam = params.get("hero");
  const heroes = useAsync(fetchHeroStats, "heroes");
  const selectedHero = heroParam ? Number(heroParam) : (heroes.data ? [...heroes.data.heroes].sort((a, b) => b.win_rate - a.win_rate)[0]?.hero_id : null);
  const items = useAsync(
    () => (selectedHero ? fetchHeroItemStats(selectedHero) : Promise.resolve(null)),
    `items-${selectedHero}`,
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow={heroes.data ? `Patch ${heroes.data.patch}` : "Stats"}
        title="Heroes & Items"
        description="Win and pick rates for the current patch. Select a hero to see which items win games on it."
      />

      {heroes.error && <ErrorState message={`${heroes.error}. Refresh to try again.`} />}
      {!heroes.data && !heroes.error && <LoadingState label="Loading stats…" />}

      {heroes.data && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Section title="Heroes" description="Sorted by win rate · bars show distance from 50%">
            <RateTable
              rows={heroes.data.heroes}
              nameLabel="Hero"
              getKey={(h) => h.hero_id}
              selectedKey={selectedHero}
              onSelect={(h) => setParams({ hero: String(h.hero_id) }, { replace: true })}
            />
          </Section>

          <Section
            title={items.data ? `${items.data.hero_name} · Items` : "Items"}
            description="Win rate in games where the item was bought"
            className="lg:self-start"
          >
            {items.error && <ErrorState message={items.error} />}
            {!items.data && !items.error && <LoadingState label="Loading items…" />}
            {items.data && <RateTable rows={items.data.items} nameLabel="Item" getKey={(it) => it.item_id} />}
          </Section>
        </div>
      )}
    </PageShell>
  );
}

export default StatsPage;
