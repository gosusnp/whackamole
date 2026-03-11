/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { createContext } from 'preact';
import { useContext, useState, useMemo, useEffect, useRef } from 'preact/hooks';
import type { StateUpdater, Dispatch } from 'preact/hooks';
import type { Task } from './types';

interface HeaderContextType {
  promotedTask: Task | null;
  setPromotedTask: Dispatch<StateUpdater<Task | null>>;
  headerHeight: number;
  setHeaderHeight: (height: number) => void;
  isCondensed: boolean;
  // Promotion Handlers
  onEdit?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  setPromotionHandlers: (handlers: {
    onEdit?: () => void;
    onDelete?: () => void;
    onUndo?: () => void;
  }) => void;
  // Deletion state for promoted task
  isDeletingPromoted: boolean;
  setIsDeletingPromoted: (isDeleting: boolean) => void;
  onDeleteCommit?: () => void;
  setOnDeleteCommit: (cb?: () => void) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: preact.ComponentChildren }) {
  const [promotedTask, setPromotedTask] = useState<Task | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isCondensed, setIsCondensed] = useState(false);
  const [handlers, setHandlers] = useState<{
    onEdit?: () => void;
    onDelete?: () => void;
    onUndo?: () => void;
  }>({});
  const [isDeletingPromoted, setIsDeletingPromoted] = useState(false);
  const [onDeleteCommit, setOnDeleteCommit] = useState<(() => void) | undefined>(undefined);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsCondensed((prev) => {
          // Hysteresis: switch at 120, switch back at 40 to prevent flapping
          if (!prev && scrollY >= 120) return true;
          if (prev && scrollY < 40) return false;
          return prev;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      promotedTask,
      setPromotedTask,
      headerHeight,
      setHeaderHeight,
      isCondensed,
      onEdit: handlers.onEdit,
      onDelete: handlers.onDelete,
      onUndo: handlers.onUndo,
      setPromotionHandlers: setHandlers,
      isDeletingPromoted,
      setIsDeletingPromoted,
      onDeleteCommit,
      setOnDeleteCommit,
    }),
    [
      promotedTask,
      headerHeight,
      isCondensed,
      handlers,
      isDeletingPromoted,
      onDeleteCommit,
      setHeaderHeight,
    ],
  );

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
