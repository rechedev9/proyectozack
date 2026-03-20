'use client';

import * as motion from 'motion/react-client';
import type { ReactNode } from 'react';

type FadeInOnScrollProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before animation starts after becoming visible */
  delay?: number;
}

export function FadeInOnScroll({ children, className = '', delay = 0 }: FadeInOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
