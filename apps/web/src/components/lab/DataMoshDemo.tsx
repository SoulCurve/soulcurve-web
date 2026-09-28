import { useEffect, useRef } from "react";

/**
 * Datamosh-style block smear: draws a still "keyframe" (a stat-card mock),
 * then repeatedly shifts random horizontal bands sideways and blends them
 * with the previous frame instead of clearing it, the way a corrupted P-frame
 * carries motion vectors without a new keyframe.
 */
function DataMoshDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const drawKeyframe = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111113";
      ctx.fillRect(0, 0, w, h);

      // A few "chart bars" so the smear has something readable to distort.
      const bars = 7;
      for (let i = 0; i < bars; i++) {
        const bw = w / bars;
        const bh = h * (0.2 + 0.6 * Math.abs(Math.sin(i * 1.7)));
        ctx.fillStyle = i % 2 === 0 ? "#3ddc84" : "#22a85a";
        ctx.fillRect(i * bw + bw * 0.15, h - bh, bw * 0.7, bh);
      }
      ctx.strokeStyle = "rgb(255 255 255 / 0.15)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < h; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
    };

    const smear = () => {
      // Grab the current frame, shift a random band horizontally, paint it back.
      const bandH = 6 + Math.random() * 26;
      const y = Math.random() * (h - bandH);
      const shift = (Math.random() - 0.5) * 60;
      const band = ctx.getImageData(0, Math.max(0, y), w, bandH);
      ctx.putImageData(band, shift, Math.max(0, y));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawKeyframe();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let frame = 0;
    let nextKeyframeAt = 90 + Math.random() * 60;
    const loop = () => {
      frame++;
      if (frame >= nextKeyframeAt) {
        drawKeyframe();
        frame = 0;
        nextKeyframeAt = 90 + Math.random() * 60;
      } else if (frame % 6 === 0) {
        smear();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-md">
      <canvas ref={canvasRef} className="size-full" aria-hidden="true" />
    </div>
  );
}

export default DataMoshDemo;
