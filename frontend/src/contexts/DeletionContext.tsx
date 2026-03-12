/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext, useState, useCallback } from 'preact/hooks';

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
}

const DeletionContext = createContext<DeletionContextType | undefined>(undefined);

export function DeletionProvider({ children }: { children: ComponentChildren }) {
  const [pendingDeletions, setPendingDeletions] = useState<Record<number, DeletionInfo>>({});

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
      value={{ pendingDeletions, startDeletion, cancelDeletion, getDeletion }}
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
