/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import { memo } from 'preact/compat';
import { useDeletion } from '../contexts/DeletionContext';

export const DELETION_DURATION = 10000;

interface DeletionProgressBarProps {
  taskId: number;
  startTime: number;
  onComplete: () => void;
  className?: string;
  position?: 'top' | 'bottom';
}

export const DeletionProgressBar = memo(function DeletionProgressBar({
  taskId,
  startTime,
  onComplete,
  className,
  position = 'bottom',
}: DeletionProgressBarProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { getDeletion } = useDeletion();

  const [progress, setProgress] = useState(() => {
    const elapsed = Date.now() - startTime;
    return Math.max(0, 1 - elapsed / DELETION_DURATION);
  });

  useEffect(() => {
    let active = true;
    const update = () => {
      if (!active) return;

      // Check if this task is still being deleted in the global context
      const isStillPending = !!getDeletion(taskId);
      if (!isStillPending) {
        active = false;
        return;
      }

      const elapsed = Date.now() - startTime;
      const nextProgress = Math.max(0, 1 - elapsed / DELETION_DURATION);
      setProgress(nextProgress);

      if (nextProgress > 0) {
        requestAnimationFrame(update);
      } else {
        active = false;
        onCompleteRef.current();
      }
    };

    const raf = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [startTime, taskId, getDeletion]);

  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  // Drive color change via JS to match CSS animation logic
  // 1.0 to 0.4: blue (var(--accent-blue))
  // 0.3 to 0.0: red (var(--type-bug))
  const color = progress > 0.3 ? 'var(--accent-blue)' : 'var(--type-bug)';

  return (
    <div
      role="progressbar"
      aria-live="assertive"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={`absolute left-0 h-[2px] w-full origin-left transition-colors duration-200 ${positionClass} ${className || ''}`}
      style={{
        transform: `scaleX(${progress})`,
        backgroundColor: color,
      }}
    />
  );
});
