/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/preact';
import { TaskTypeBadge } from './TaskTypeBadge';
import type { Task } from '../types';

vi.mock('./ui/Popover', () => ({
  Popover: ({
    children,
    trigger,
    open,
    onOpenChange,
  }: {
    children: unknown;
    trigger: unknown;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div>
      <div data-testid="popover-trigger" onClick={() => onOpenChange?.(!open)}>
        {trigger}
      </div>
      {open && <div data-testid="popover-content">{children}</div>}
    </div>
  ),
}));

vi.mock('./ui/ToggleGroup', () => ({
  ToggleGroup: ({
    items,
    onValueChange,
  }: {
    items: { value: string; label: string }[];
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div>
      {items.map((item) => (
        <button key={item.value} onClick={() => onValueChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

const mockTask: Task = {
  id: 1,
  projectId: 1,
  name: 'Test task',
  description: '',
  type: 'feat',
  status: 'notStarted',
};

describe('TaskTypeBadge', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays the current type', () => {
    render(<TaskTypeBadge task={mockTask} onTypeUpdate={vi.fn()} />);
    expect(screen.getByText('feat')).toBeInTheDocument();
  });

  it('calls fetch and onTypeUpdate when a different type is selected', async () => {
    const onTypeUpdate = vi.fn();
    render(<TaskTypeBadge task={mockTask} onTypeUpdate={onTypeUpdate} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    fireEvent.click(screen.getByText('fix'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}`,
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(onTypeUpdate).toHaveBeenCalledWith('fix');
    });
  });

  it('does not call fetch when the same type is selected', async () => {
    render(<TaskTypeBadge task={mockTask} onTypeUpdate={vi.fn()} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    fireEvent.click(within(screen.getByTestId('popover-content')).getByText('feat'));

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
