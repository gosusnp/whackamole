/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef } from 'preact/hooks';
import { memo } from 'preact/compat';

interface DeletionProgressBarProps {
  onComplete: () => void;
  className?: string;
  position?: 'top' | 'bottom';
}

export const DeletionProgressBar = memo(function DeletionProgressBar({
  onComplete,
  className,
  position = 'bottom',
}: DeletionProgressBarProps) {
  // Use a ref to ensure the timer always calls the latest onComplete
  // without ever needing to restart the useEffect.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 10000);
    return () => clearTimeout(timer);
  }, []); // Run exactly once on mount

  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div
      role="progressbar"
      aria-live="assertive"
      aria-valuemin={0}
      aria-valuemax={100}
      className={`animate-deletion absolute left-0 h-[2px] w-full origin-left ${positionClass} ${className || ''}`}
    />
  );
});
