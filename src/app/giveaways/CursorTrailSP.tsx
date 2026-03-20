'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 20;
const FADE_SPEED = 0.92;

// SP brand gradient stops: orange → pink → dpink → purple
const GRADIENT = [
  [245, 99, 42],   // sp-orange
  [224, 48, 112],  // sp-pink
  [196, 40, 128],  // sp-dpink
  [139, 58, 173],  // sp-purple
] as const;

function lerpColor(t: number): [number, number, number] {
  const idx = t * (GRADIENT.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, GRADIENT.length - 1);
  const frac = idx - lo;
  return [
    Math.round(GRADIENT[lo]![0] + (GRADIENT[hi]![0] - GRADIENT[lo]![0]) * frac),
    Math.round(GRADIENT[lo]![1] + (GRADIENT[hi]![1] - GRADIENT[lo]![1]) * frac),
    Math.round(GRADIENT[lo]![2] + (GRADIENT[hi]![2] - GRADIENT[lo]![2]) * frac),
  ];
}

type Point = {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

export function CursorTrailSP() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('mousemove', onMove);

    function draw() {
      if (!ctx || !canvas) return;

      points.current.push({
        x: mouse.current.x,
        y: mouse.current.y,
        alpha: 1,
        size: 4,
      });

      if (points.current.length > TRAIL_LENGTH) {
        points.current.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < points.current.length; i++) {
        const p = points.current[i]!;
        p.alpha *= FADE_SPEED;
        p.size *= 0.97;

        if (p.alpha < 0.01) continue;

        const progress = i / points.current.length;
        const [r, g, b] = lerpColor(progress);

        // Glow circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 8 * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.08})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      // Leading dot
      if (points.current.length > 0) {
        const last = points.current[points.current.length - 1]!;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 99, 42, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 99, 42, 0.04)';
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    }

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
