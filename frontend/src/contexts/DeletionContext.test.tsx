/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, act, screen } from '@testing-library/preact';
import { DeletionProvider, useDeletion } from './DeletionContext';
import { useState } from 'preact/hooks';

const TestComponent = ({ taskId, onComplete }: { taskId: number; onComplete: () => void }) => {
  const { startDeletion, cancelDeletion, getDeletion } = useDeletion();
  const info = getDeletion(taskId);

  return (
    <div>
      <div data-testid="status">{info ? 'deleting' : 'idle'}</div>
      <button data-testid="start" onClick={() => startDeletion(taskId, onComplete)}>
        Start
      </button>
      <button data-testid="cancel" onClick={() => cancelDeletion(taskId)}>
        Cancel
      </button>
    </div>
  );
};

describe('DeletionContext', () => {
  it('manages pending deletions', async () => {
    const onComplete = vi.fn();
    const { getByTestId } = render(
      <DeletionProvider>
        <TestComponent taskId={1} onComplete={onComplete} />
      </DeletionProvider>,
    );

    expect(getByTestId('status').textContent).toBe('idle');

    await act(async () => {
      getByTestId('start').click();
    });

    expect(getByTestId('status').textContent).toBe('deleting');

    await act(async () => {
      getByTestId('cancel').click();
    });

    expect(getByTestId('status').textContent).toBe('idle');
  });

  it('persists state across unmount and remount', async () => {
    const onComplete = vi.fn();

    const Container = () => {
      const [show, setShow] = useState(true);
      return (
        <DeletionProvider>
          {show && <TestComponent taskId={1} onComplete={onComplete} />}
          <button data-testid="toggle" onClick={() => setShow(!show)}>
            Toggle
          </button>
        </DeletionProvider>
      );
    };

    const { getByTestId } = render(<Container />);

    // 1. Start deletion
    await act(async () => {
      getByTestId('start').click();
    });
    expect(getByTestId('status').textContent).toBe('deleting');

    // 2. Unmount child
    await act(async () => {
      getByTestId('toggle').click();
    });
    expect(screen.queryByTestId('status')).toBeNull();

    // 3. Remount child
    await act(async () => {
      getByTestId('toggle').click();
    });

    // 4. Verify state is still there
    expect(getByTestId('status').textContent).toBe('deleting');
  });
});
