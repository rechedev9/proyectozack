'use client';

import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 20;
const FADE_SPEED = 0.92;

type Point = {
  x: number;
  y: number;
  alpha: number;
  size: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const hasMoved = useRef(false);
  const isActive = useRef(false);
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

    function draw() {
      if (!ctx || !canvas) return;

      // Only push a new point when mouse actually moved
      if (hasMoved.current) {
        hasMoved.current = false;
        points.current.push({
          x: mouse.current.x,
          y: mouse.current.y,
          alpha: 1,
          size: 4,
        });
        if (points.current.length > TRAIL_LENGTH) {
          points.current.shift();
        }
      }

      // Fade existing points
      let maxAlpha = 0;
      for (const p of points.current) {
        p.alpha *= FADE_SPEED;
        p.size *= 0.97;
        if (p.alpha > maxAlpha) maxAlpha = p.alpha;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw trail
      for (let i = 0; i < points.current.length; i++) {
        const p = points.current[i]!;
        if (p.alpha < 0.01) continue;

        const progress = i / points.current.length;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + 8 * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 252, 0, ${p.alpha * 0.08})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 252, 0, ${p.alpha * 0.5})`;
        ctx.fill();
      }

      // Leading dot
      if (points.current.length > 0) {
        const last = points.current[points.current.length - 1]!;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 252, 0, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(last.x, last.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 252, 0, 0.04)';
        ctx.fill();
      }

      // Go idle when all points are faded and mouse is not moving
      if (maxAlpha < 0.01 && !hasMoved.current) {
        isActive.current = false;
        return; // Don't schedule next frame
      }

      raf.current = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
      hasMoved.current = true;
      // Wake up the RAF loop if it went idle
      if (!isActive.current) {
        isActive.current = true;
        raf.current = requestAnimationFrame(draw);
      }
    }
    window.addEventListener('mousemove', onMove);

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
