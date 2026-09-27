export const CHART = {
  mark: "#22a85a",
  grid: "rgba(255,255,255,0.06)",
  axis: "#8b8b94",
  reference: "rgba(255,255,255,0.18)",
  surface: "#111113",
} as const;

export const axisProps = {
  stroke: CHART.grid,
  tick: { fill: CHART.axis, fontSize: 11, fontFamily: "Geist Mono Variable, monospace" },
  tickLine: false,
} as const;

export const percent = (v: number) => `${Math.round(v * 100)}%`;
