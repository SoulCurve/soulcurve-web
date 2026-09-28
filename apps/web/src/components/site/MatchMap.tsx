import { useRef, useState } from "react";
import { Box, RotateCcw, Square } from "lucide-react";
import type { MatchMapResponse } from "@/api";
import { TeamLabel } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";

const TEAM_COLOR = { amber: "var(--amber)", sapphire: "var(--sapphire)" } as const;
const LANES = [20, 50, 80];
const RECENT_MIN = 3;
const DEFAULT_VIEW = { tilt: 55, spin: -20 };

function MatchMap({ map, t }: { map: MatchMapResponse; t: number }) {
  const [view, setView] = useState(DEFAULT_VIEW);
  const drag = useRef<{ x: number; y: number; tilt: number; spin: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const flat = view.tilt === 0 && view.spin === 0;

  const kills = map.kills.filter((k) => k.t_min <= t);
  const tally = { amber: 0, sapphire: 0 };
  for (const k of kills) tally[k.team] += 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-foreground tabular-nums">{kills.length}</span> kills so far ·{" "}
          <span className="font-mono tabular-nums" style={{ color: TEAM_COLOR.amber }}>
            {tally.amber}
          </span>{" "}
          –{" "}
          <span className="font-mono tabular-nums" style={{ color: TEAM_COLOR.sapphire }}>
            {tally.sapphire}
          </span>
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView(flat ? DEFAULT_VIEW : { tilt: 0, spin: 0 })}
          >
            {flat ? <Box /> : <Square />}
            {flat ? "3D view" : "Top-down"}
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setView(DEFAULT_VIEW)} aria-label="Reset map view">
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden py-2">
      <div
        className="relative mx-auto aspect-square w-[80%] max-w-md cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ perspective: "1100px" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, ...view };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const { x, y, tilt, spin } = drag.current;
          setView({
            spin: spin + (e.clientX - x) * 0.4,
            tilt: Math.min(70, Math.max(0, tilt - (e.clientY - y) * 0.3)),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        role="img"
        aria-label={`Schematic match map at ${Math.round(t)} minutes: ${kills.length} kills, amber ${tally.amber}, sapphire ${tally.sapphire}. Drag to rotate.`}
      >
        <div
          className="size-full transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${view.tilt}deg) rotateZ(${view.spin}deg)`,
            transformStyle: "preserve-3d",
            transitionDuration: dragging ? "0ms" : undefined,
          }}
        >
          <svg viewBox="0 0 100 100" className="size-full overflow-visible drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]">
            <defs>
              <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M5 0H0V5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              </pattern>
              <radialGradient id="kill-glow">
                <stop offset="0" stopColor="white" stopOpacity="0.35" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100" height="100" rx="4" fill="#111113" stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" />
            <rect width="100" height="100" rx="4" fill="url(#map-grid)" />
            <rect x="0" y="50" width="100" height="50" rx="4" fill={TEAM_COLOR.amber} opacity="0.035" />
            <rect x="0" y="0" width="100" height="50" rx="4" fill={TEAM_COLOR.sapphire} opacity="0.035" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.12)" strokeDasharray="1.5 1.5" strokeWidth="0.3" />

            {LANES.map((x) => (
              <path
                key={x}
                d={`M50 92 C ${x} 80, ${x} 70, ${x} 50 S ${x} 20, 50 8`}
                fill="none"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ))}

            {map.objectives.map((o) => {
              const down = o.destroyed_at !== null && o.destroyed_at <= t;
              const size = o.name === "Patron" ? 3.4 : o.name === "Walker" ? 2.4 : 1.8;
              const cx = o.x * 100;
              const cy = o.y * 100;
              return (
                <g key={`${o.owner}-${o.name}-${o.lane}`} opacity={down ? 0.35 : 1}>
                  <rect
                    x={cx - size}
                    y={cy - size}
                    width={size * 2}
                    height={size * 2}
                    transform={`rotate(45 ${cx} ${cy})`}
                    fill={down ? "transparent" : TEAM_COLOR[o.owner]}
                    stroke={TEAM_COLOR[o.owner]}
                    strokeWidth="0.5"
                  />
                  {down && (
                    <path
                      d={`M${cx - size} ${cy - size}L${cx + size} ${cy + size}M${cx + size} ${cy - size}L${cx - size} ${cy + size}`}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  )}
                  <title>
                    {`${o.owner} ${o.name} (${o.lane})${down ? `, destroyed at ${o.destroyed_at}m` : ""}`}
                  </title>
                </g>
              );
            })}

            {kills.map((k) => {
              const age = t - k.t_min;
              const recent = age <= RECENT_MIN;
              return (
                <g key={`${k.t_min}-${k.x}-${k.y}`}>
                  {recent && <circle cx={k.x * 100} cy={k.y * 100} r="4" fill="url(#kill-glow)" />}
                  <circle
                    cx={k.x * 100}
                    cy={k.y * 100}
                    r={recent ? 1.3 : 0.9}
                    fill={TEAM_COLOR[k.team]}
                    opacity={recent ? 1 : Math.max(0.3, 1 - age / 20)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      </div>

      <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Dots: kills, colored by the team that got them</span>
        <span>Diamonds: Guardians, Walkers, Patron</span>
        <TeamLabel team="amber" />
        <TeamLabel team="sapphire" />
      </p>
    </div>
  );
}

export default MatchMap;
