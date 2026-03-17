
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = '' }: SectionHeadingProps) {
  return (
    <h2
      className={`font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-sp-dark leading-tight ${className}`}
    >
      {children}
    </h2>
  );
}
