/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/preact';
import { TaskStatusBadge } from './TaskStatusBadge';
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

describe('TaskStatusBadge', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays the current status label', () => {
    render(<TaskStatusBadge task={mockTask} onStatusUpdate={vi.fn()} />);
    expect(screen.getByText('NOT STARTED')).toBeInTheDocument();
  });

  it('displays completed status label', () => {
    const task = { ...mockTask, status: 'completed' };
    render(<TaskStatusBadge task={task} onStatusUpdate={vi.fn()} />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('displays raw status value if no label is found', () => {
    const task = { ...mockTask, status: 'unknown' as TaskStatus };
    render(<TaskStatusBadge task={task} onStatusUpdate={vi.fn()} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('calls fetch and onStatusUpdate when a different status is selected', async () => {
    const onStatusUpdate = vi.fn();
    render(<TaskStatusBadge task={mockTask} onStatusUpdate={onStatusUpdate} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    fireEvent.click(screen.getByText('IN PROGRESS'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'inProgress' }),
        }),
      );
      // Ensure no other fields from the task are sent
      const lastCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(lastCallBody).not.toHaveProperty('name');
      expect(lastCallBody).not.toHaveProperty('description');
      expect(lastCallBody).not.toHaveProperty('type');
      expect(lastCallBody).not.toHaveProperty('id');

      expect(onStatusUpdate).toHaveBeenCalledWith('inProgress');
    });
  });

  it('does not call fetch when the same status is selected', async () => {
    render(<TaskStatusBadge task={mockTask} onStatusUpdate={vi.fn()} />);

    fireEvent.click(screen.getByTestId('popover-trigger'));
    fireEvent.click(within(screen.getByTestId('popover-content')).getByText('NOT STARTED'));

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
