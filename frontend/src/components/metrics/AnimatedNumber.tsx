'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { motionConfig, springs } from '@/lib/motion-tokens';

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
}

/**
 * Animates a numeric value transitioning to a new value (e.g. after a date
 * range change or data sync) — not a meaningless count-from-zero on every
 * mount, which would get old fast on a page opened many times a day.
 * Falls back to plain text under prefers-reduced-motion.
 */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(!motionConfig.shouldAnimate({ essential: false }));
  }, []);

  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, springs.gentle);
  const display = useTransform(springValue, (v) => format(Math.round(v)));
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
    motionValue.set(value);
  }, [value, motionValue]);

  if (reduced) {
    return <span className={className}>{format(value)}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
