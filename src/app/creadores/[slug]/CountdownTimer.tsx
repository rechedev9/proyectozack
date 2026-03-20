'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface CountdownTimerProps {
  endsAt: string;
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endsAt: string): TimeLeft | null {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-12 bg-[#0b0c0e] border border-[#1a1b1e] rounded-lg flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-xl font-black text-[#C3FC00] tabular-nums"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ endsAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => {
      const tl = calcTimeLeft(endsAt);
      setTimeLeft(tl);
      if (!tl) {
        clearInterval(id);
        onExpired?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, onExpired]);

  if (!timeLeft) {
    return (
      <div className="inline-flex px-4 py-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-sm font-bold uppercase tracking-wider text-white/50">Finalizado</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <FlipDigit value={timeLeft.days} label="Días" />
      <FlipDigit value={timeLeft.hours} label="Hrs" />
      <FlipDigit value={timeLeft.minutes} label="Min" />
      <FlipDigit value={timeLeft.seconds} label="Seg" />
    </div>
  );
}
