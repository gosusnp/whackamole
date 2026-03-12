/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext, useState, useCallback, useRef } from 'preact/hooks';

interface DeletionInfo {
  taskId: number;
  startTime: number;
  onComplete: () => void;
}

interface DeletionContextType {
  pendingDeletions: Record<number, DeletionInfo>;
  startDeletion: (taskId: number, onComplete: () => void) => void;
  cancelDeletion: (taskId: number) => void;
  getDeletion: (taskId: number) => DeletionInfo | undefined;
  subscribe: (callback: (now: number) => void) => () => void;
}

const DeletionContext = createContext<DeletionContextType | undefined>(undefined);

export function DeletionProvider({ children }: { children: ComponentChildren }) {
  const [pendingDeletions, setPendingDeletions] = useState<Record<number, DeletionInfo>>({});
  const listeners = useRef<Set<(now: number) => void>>(new Set());
  const rafRef = useRef<number>();

  const tick = useCallback(() => {
    if (listeners.current.size === 0) {
      rafRef.current = undefined;
      return;
    }

    const now = Date.now();
    // Safe iteration even if listeners are removed during callback
    Array.from(listeners.current).forEach((cb) => cb(now));

    if (listeners.current.size > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = undefined;
    }
  }, []);

  const subscribe = useCallback(
    (cb: (now: number) => void) => {
      listeners.current.add(cb);
      if (listeners.current.size === 1 && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
      return () => {
        listeners.current.delete(cb);
        if (listeners.current.size === 0 && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = undefined;
        }
      };
    },
    [tick],
  );

  const startDeletion = useCallback((taskId: number, onComplete: () => void) => {
    setPendingDeletions((prev) => ({
      ...prev,
      [taskId]: {
        taskId,
        startTime: Date.now(),
        onComplete,
      },
    }));
  }, []);

  const cancelDeletion = useCallback((taskId: number) => {
    setPendingDeletions((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  const getDeletion = useCallback(
    (taskId: number) => {
      return pendingDeletions[taskId];
    },
    [pendingDeletions],
  );

  return (
    <DeletionContext.Provider
      value={{ pendingDeletions, startDeletion, cancelDeletion, getDeletion, subscribe }}
    >
      {children}
    </DeletionContext.Provider>
  );
}

export function useDeletion() {
  const context = useContext(DeletionContext);
  if (context === undefined) {
    throw new Error('useDeletion must be used within a DeletionProvider');
  }
  return context;
}
