import type { ReactNode } from "react";

function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

export default StatTile;
