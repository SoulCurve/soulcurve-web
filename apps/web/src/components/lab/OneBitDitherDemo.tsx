import { useEffect, useRef } from "react";

// 4x4 Bayer matrix, normalized to 0..15, used as the ordered-dither threshold map.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * 1-bit ordered dither: renders a soft radial gradient that drifts with the
 * pointer, then quantizes every pixel to on/off (soul green or background)
 * using the Bayer threshold map instead of a flat cutoff, so the gradient
 * reads as a dithered halftone rather than a hard-edged circle.
 */
function OneBitDitherDemo({ cell = 4, className = "h-64" }: { cell?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let cols = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cw = rect.width;
      ch = rect.height;
      canvas.width = cw;
      canvas.height = ch;
      cols = Math.ceil(cw / cell);
      rows = Math.ceil(ch / cell);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("pointermove", onMove);

    let t = 0;
    const loop = () => {
      t += 0.01;
      const cx = target.current ? target.current.x * cw : cw * (0.5 + 0.3 * Math.sin(t));
      const cy = target.current ? target.current.y * ch : ch * (0.5 + 0.3 * Math.cos(t * 0.8));
      const maxDist = Math.hypot(cw, ch) * 0.5;

      ctx.fillStyle = "#0a0a0b";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = "#3ddc84";

      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const px = gx * cell + cell / 2;
          const py = gy * cell + cell / 2;
          const dist = Math.hypot(px - cx, py - cy);
          const intensity = Math.max(0, 1 - dist / maxDist);
          const threshold = (BAYER_4X4[gy % 4][gx % 4] + 0.5) / 16;
          if (intensity > threshold) {
            ctx.fillRect(gx * cell, gy * cell, cell, cell);
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
    };
  }, [cell]);

  return (
    <div className={`relative w-full overflow-hidden rounded-md ${className}`}>
      <canvas ref={canvasRef} className="size-full" aria-hidden="true" />
    </div>
  );
}

export default OneBitDitherDemo;
