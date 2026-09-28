export const CHART = {
  mark: "#22a85a",
  grid: "rgba(255,255,255,0.06)",
  axis: "#8b8b94",
  reference: "rgba(255,255,255,0.18)",
  surface: "#111113",
} as const;

export const axisProps = {
  stroke: CHART.grid,
  tick: { fill: CHART.axis, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" },
  tickLine: false,
} as const;

export const percent = (v: number) => `${Math.round(v * 100)}%`;

export const usd = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

// Win probability at time `t`, linearly interpolated between the model's samples.
export function interpolate(points: { t_min: number; p_win: number }[], t: number) {
  const after = points.findIndex((p) => p.t_min >= t);
  if (after === -1) return points[points.length - 1].p_win;
  if (after === 0) return points[0].p_win;
  const a = points[after - 1];
  const b = points[after];
  return a.p_win + ((t - a.t_min) / (b.t_min - a.t_min)) * (b.p_win - a.p_win);
}
