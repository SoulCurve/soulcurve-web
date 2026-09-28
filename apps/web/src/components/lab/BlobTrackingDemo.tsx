import { useEffect, useRef } from "react";

type Blob = { x: number; y: number; vx: number; vy: number; r: number };

const BLOB_COUNT = 5;

/**
 * Gooey cursor-tracking blobs: an SVG blur+contrast filter fuses overlapping
 * circles into one metaball shape. Blobs drift on their own and lerp toward
 * the pointer when it's inside the frame.
 */
function BlobTrackingDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const blobs = useRef<Blob[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const circles = Array.from(svg.querySelectorAll<SVGCircleElement>("circle[data-blob]"));
    let raf = 0;
    let w = container.clientWidth;
    let h = container.clientHeight;

    blobs.current = Array.from({ length: BLOB_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: 16 + Math.random() * 14,
    }));

    const onResize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const step = () => {
      for (const [i, b] of blobs.current.entries()) {
        if (pointer.current.active && i === 0) {
          b.x += (pointer.current.x - b.x) * 0.12;
          b.y += (pointer.current.y - b.y) * 0.12;
        } else {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < 0 || b.x > w) b.vx *= -1;
          if (b.y < 0 || b.y > h) b.vy *= -1;
          b.x = Math.max(0, Math.min(w, b.x));
          b.y = Math.max(0, Math.min(h, b.y));
          if (pointer.current.active) {
            b.x += (pointer.current.x - b.x) * 0.015 * i;
            b.y += (pointer.current.y - b.y) * 0.015 * i;
          }
        }
        const circle = circles[i];
        circle?.setAttribute("cx", String(b.x));
        circle?.setAttribute("cy", String(b.y));
        circle?.setAttribute("r", String(b.r));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-64 w-full overflow-hidden rounded-md bg-background">
      <svg ref={svgRef} className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <filter id="lab-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="goo"
            />
          </filter>
        </defs>
        <g filter="url(#lab-goo)">
          {Array.from({ length: BLOB_COUNT }, (_, i) => (
            <circle key={i} data-blob r="20" className="fill-soul/70" />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default BlobTrackingDemo;
