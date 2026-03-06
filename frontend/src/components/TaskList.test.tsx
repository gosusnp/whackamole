/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';
import { TaskList } from './TaskList';
import type { Task } from '../types';

vi.mock('./TaskItem', () => ({
  TaskItem: ({ task }: { task: Task }) => <div data-testid="task-item">{task.name}</div>,
}));

const mockTasks: Task[] = [
  {
    id: 1,
    projectId: 1,
    name: 'First task',
    description: 'Desc 1',
    type: 'feat',
    status: 'notStarted',
  },
  {
    id: 2,
    projectId: 1,
    name: 'Second task',
    description: 'Desc 2',
    type: 'fix',
    status: 'inProgress',
  },
];

describe('TaskList', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<TaskList projectId={1} />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('renders tasks after fetch resolves', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTasks),
    });

    render(<TaskList projectId={1} />);

    await waitFor(() => {
      expect(screen.getAllByTestId('task-item')).toHaveLength(2);
      expect(screen.getByText('First task')).toBeInTheDocument();
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks are returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<TaskList projectId={1} />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<TaskList projectId={1} />);

    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows error when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(<TaskList projectId={1} />);

    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('fetches with the correct projectId', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<TaskList projectId={42} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks?projectId=42',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it('refetches when projectId changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { rerender } = render(<TaskList projectId={1} />);
    await screen.findByText('No tasks found.');

    rerender(<TaskList projectId={2} />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/tasks?projectId=2',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });
});
