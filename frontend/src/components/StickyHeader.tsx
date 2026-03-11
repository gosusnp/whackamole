/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef } from 'preact/hooks';
import { Row } from './ui/Row';
import { Heading } from './ui/Heading';
import { Button } from './ui/Button';
import { Text } from './ui/Text';
import { ConfigDialog } from './ConfigDialog';
import { Sun, Moon, Edit2, Trash2, Undo2 } from 'lucide-preact';
import { useHeader } from '../HeaderContext';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { DeletionProgressBar } from './DeletionProgressBar';
import type { ComponentChildren } from 'preact';

interface StickyHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  tabsList?: ComponentChildren;
  headerExtra?: ComponentChildren;
}

export function StickyHeader({ theme, toggleTheme, tabsList, headerExtra }: StickyHeaderProps) {
  const {
    promotedTask,
    setHeaderHeight,
    onEdit,
    onDelete,
    onUndo,
    isCondensed,
    isDeletingPromoted,
    onDeleteCommit,
  } = useHeader();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isCondensed, promotedTask, isDeletingPromoted, setHeaderHeight]);

  return (
    <header
      ref={headerRef}
      className={`bg-bg-base sticky top-0 z-40 w-full transition-shadow duration-200 ${
        isCondensed ? 'border-border-base border-b shadow-md' : 'mb-8'
      }`}
      style={{ overflowAnchor: 'none' }}
    >
      <div className={`mx-auto max-w-6xl px-8 ${isCondensed ? 'py-2' : 'pt-8'}`}>
        {!isCondensed && (
          <Row justify="between" items="center" className="mb-8">
            <Row items="center" gap={4} fullWidth={false}>
              <img
                src="/favicon.png"
                alt=""
                className="h-8 w-8"
                style={{ filter: 'var(--logo-filter)' }}
              />
              <Heading level={1} noMargin>
                whackAmole
              </Heading>
            </Row>
            <div className="flex-1" />
            <Row items="center" gap={2} fullWidth={false}>
              <ConfigDialog />
              <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
            </Row>
          </Row>
        )}

        <Row justify="between" items="center" gap={4}>
          <div className="min-w-0 flex-1">{tabsList}</div>
          {isCondensed && (
            <Row items="center" gap={2} fullWidth={false}>
              {headerExtra}
              <ConfigDialog />
              <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
            </Row>
          )}
        </Row>

        {promotedTask && isCondensed && (
          <div className="border-border-base relative mt-2 border-t pt-2">
            {isDeletingPromoted && onDeleteCommit && (
              <DeletionProgressBar
                onComplete={onDeleteCommit}
                position="top"
                className="absolute top-0 right-[-32px] left-[-32px] h-[2px]"
              />
            )}
            <Row
              items="center"
              gap={4}
              className="animate-in slide-in-from-top-2 pb-1 duration-200"
            >
              <Text muted small className="text-mono">
                #{promotedTask.id}
              </Text>
              <TaskTypeBadge task={promotedTask} />
              <Heading level={3} noMargin className="flex-1 truncate">
                {promotedTask.name}
              </Heading>
              <Row items="center" gap={2} fullWidth={false}>
                {!isDeletingPromoted ? (
                  <>
                    <Button variant="ghost" onClick={onEdit} aria-label="Edit promoted task">
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onDelete}
                      aria-label="Delete promoted task"
                      className="btn-ghost-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={onUndo} aria-label="Undo deletion">
                    <Undo2 size={14} className="text-brand-primary" />
                  </Button>
                )}
                <TaskStatusBadge task={promotedTask} />
              </Row>
            </Row>
          </div>
        )}
      </div>
    </header>
  );
}
