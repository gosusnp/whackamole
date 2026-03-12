/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/preact';
import { DeletionProgressBar, DELETION_DURATION } from './DeletionProgressBar';
import { DeletionProvider, useDeletion } from '../contexts/DeletionContext';

const TestWrapper = ({
  taskId,
  startTime,
  onComplete,
}: {
  taskId: number;
  startTime: number;
  onComplete: () => void;
}) => {
  const { startDeletion, cancelDeletion } = useDeletion();

  return (
    <div>
      <button data-testid="start" onClick={() => startDeletion(taskId, onComplete)}>
        Start
      </button>
      <button data-testid="cancel" onClick={() => cancelDeletion(taskId)}>
        Cancel
      </button>
      <DeletionProgressBar taskId={taskId} startTime={startTime} onComplete={onComplete} />
    </div>
  );
};

describe('DeletionProgressBar', () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onComplete after DELETION_DURATION', async () => {
    const onComplete = vi.fn();
    const startTime = Date.now();
    const { getByTestId } = render(
      <DeletionProvider>
        <TestWrapper taskId={1} startTime={startTime} onComplete={onComplete} />
      </DeletionProvider>,
    );

    // Context needs to know about the deletion for the progress bar to run
    await act(async () => {
      getByTestId('start').click();
    });

    await act(async () => {
      vi.advanceTimersByTime(DELETION_DURATION);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('stops calling onComplete if cancelled', async () => {
    const onComplete = vi.fn();
    const startTime = Date.now();
    const { getByTestId } = render(
      <DeletionProvider>
        <TestWrapper taskId={1} startTime={startTime} onComplete={onComplete} />
      </DeletionProvider>,
    );

    await act(async () => {
      getByTestId('start').click();
    });

    // Advance halfway
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Cancel
    await act(async () => {
      getByTestId('cancel').click();
    });

    // Advance the rest of the time
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
