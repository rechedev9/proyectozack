'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 20;
const FADE_SPEED = 0.92;

interface Point {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

export function CursorTrail() {
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

      // Push new point
      points.current.push({
        x: mouse.current.x,
        y: mouse.current.y,
        alpha: 1,
        size: 4,
      });

      // Trim
      if (points.current.length > TRAIL_LENGTH) {
        points.current.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw trail
      for (let i = 0; i < points.current.length; i++) {
        const p = points.current[i]!;
        p.alpha *= FADE_SPEED;
        p.size *= 0.97;

        if (p.alpha < 0.01) continue;

        const progress = i / points.current.length;

        // Glow circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 8 * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 252, 0, ${p.alpha * 0.08})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 252, 0, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      // Leading dot (current cursor position)
      if (points.current.length > 0) {
        const last = points.current[points.current.length - 1]!;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 252, 0, 0.6)';
        ctx.fill();

        // Outer glow on leading dot
        ctx.beginPath();
        ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 252, 0, 0.04)';
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
