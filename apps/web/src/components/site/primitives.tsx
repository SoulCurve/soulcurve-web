import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { fetchRanks } from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/lib/useAsync";
import { cn } from "@/lib/utils";

export function RankSelect({ value, onChange }: { value: string; onChange: (rank: string) => void }) {
  const ranks = useAsync(fetchRanks, "ranks");
  return (
    <div className="relative">
      <select
        aria-label="Filter by rank"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full cursor-pointer appearance-none rounded-md border bg-card py-1.5 pr-8 pl-3 text-sm outline-none focus-visible:border-soul/60 sm:w-40"
      >
        <option value="" className="bg-card text-foreground">
          All Ranks
        </option>
        {ranks.data?.map((rank) => (
          <option key={rank} value={rank} className="bg-card text-foreground">
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

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main id="content" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="display text-2xl leading-tight sm:text-3xl">{title}</h1>
        {description && <p className="max-w-xl text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Section({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("deco-frame min-w-0 rounded-lg border bg-card", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-sm font-medium">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card px-5 py-4">
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-2xl font-medium tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function TeamLabel({ team }: { team: string }) {
  return (
    <span className="inline-flex items-center gap-2 capitalize">
      <span aria-hidden="true" className={cn("size-2 rotate-45", team === "amber" ? "bg-amber" : "bg-sapphire")} />
      {team}
    </span>
  );
}

export function Delta({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-sm tabular-nums",
        up ? "text-good" : "text-bad",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {up ? "+" : "−"}
      {Math.abs(pct)}%
    </span>
  );
}

export function RouteTabs({ tabs }: { tabs: { to: string; label: string; end?: boolean }[] }) {
  return (
    <nav className="flex gap-1 border-b" aria-label="Match sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "border-soul text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

// Skeletons shaped like the content they stand in for, so the layout doesn't jump on load.
export function LoadingState({ label, variant = "cards" }: { label: string; variant?: "cards" | "rows" | "list" }) {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {variant === "cards" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-lg" />
        </>
      )}
      {variant === "rows" &&
        Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-7" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      {variant === "list" &&
        Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 border-b py-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
      {message}
    </p>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="deco-frame flex flex-col items-center gap-2 rounded-lg border bg-card px-6 py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
