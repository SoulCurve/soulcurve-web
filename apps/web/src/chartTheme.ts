export const CHART = {
  accent: "#1d9cb8",
  grid: "#1f2430",
  axis: "#6b7384",
  reference: "#3a4254",
} as const;

export const axisProps = {
  stroke: CHART.grid,
  tick: { fill: CHART.axis, fontSize: 12 },
  tickLine: false,
} as const;

export const percent = (v: number) => `${Math.round(v * 100)}%`;
