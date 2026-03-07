/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from 'preact/hooks';

interface DeletionProgressBarProps {
  onComplete: () => void;
  className?: string;
  position?: 'top' | 'bottom';
}

export function DeletionProgressBar({ 
  onComplete, 
  className, 
  position = 'bottom' 
}: DeletionProgressBarProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div
      role="progressbar"
      aria-live="assertive"
      aria-valuemin={0}
      aria-valuemax={100}
      className={`absolute left-0 h-[2px] w-full animate-deletion origin-left ${positionClass} ${className || ''}`}
    />
  );
}
