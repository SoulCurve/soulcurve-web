import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <section className={cn("deco-frame rounded-lg border bg-card", className)}>
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
      <span
        aria-hidden="true"
        className={cn("size-2 rotate-45", team === "amber" ? "bg-amber" : "bg-sapphire")}
      />
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

export function LoadingState({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground" role="status">
      {label}
    </p>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
      {message}
    </p>
  );
}
