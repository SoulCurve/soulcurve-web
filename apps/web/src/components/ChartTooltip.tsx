import type { ReactNode } from "react";

function ChartTooltip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-lg shadow-black/40">
      {children}
    </div>
  );
}

export default ChartTooltip;
