/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/preact';
import { TaskList } from './TaskList';
import { DeletionProvider } from '../contexts/DeletionContext';
import type { Task } from '../types';

// Use standard mocks for unit tests
vi.mock('./CreateTaskDialog', () => ({
  CreateTaskDialog: ({
    projectId,
    onTaskCreated,
  }: {
    projectId: number;
    onTaskCreated: () => void;
  }) => (
    <button data-testid="create-task-trigger" onClick={onTaskCreated}>
      Create Task for {projectId}
    </button>
  ),
}));

// Partially mock child components to allow TaskItem to be real in integration tests
vi.mock('./TaskStatusBadge', () => ({ TaskStatusBadge: () => <div /> }));
vi.mock('./TaskTypeBadge', () => ({ TaskTypeBadge: () => <div /> }));
vi.mock('./ui/Markdown', () => ({
  Markdown: ({ content }: { content: string }) => <div>{content}</div>,
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
    type: 'bug',
    status: 'inProgress',
  },
];

interface TaskUpdateEvent {
  projectId: number;
  taskId: number;
  operation: string;
  timestamp: number;
}

const renderTaskList = (props: { projectId: number; taskUpdateEvent?: TaskUpdateEvent | null }) => {
  return render(
    <DeletionProvider>
      <TaskList {...props} />
    </DeletionProvider>,
  );
};

describe('TaskList', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderTaskList({ projectId: 1 });
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('renders tasks after fetch resolves', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTasks),
    });

    renderTaskList({ projectId: 1 });

    await waitFor(() => {
      expect(screen.getByText('First task')).toBeInTheDocument();
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks are returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderTaskList({ projectId: 1 });

    await waitFor(() => {
      expect(screen.getByText('No tasks found.')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderTaskList({ projectId: 1 });

    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows error when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    renderTaskList({ projectId: 1 });

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

    const { rerender } = renderTaskList({ projectId: 1 });
    await waitFor(() => screen.getByText('No tasks found.'));

    rerender(
      <DeletionProvider>
        <TaskList projectId={2} />
      </DeletionProvider>,
    );
    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/tasks?projectId=2',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it('refetches when onTaskCreated is called', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTasks),
    });

    renderTaskList({ projectId: 1 });
    await waitFor(() => screen.getByTestId('create-task-trigger'));

    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([...mockTasks, { ...mockTasks[0], id: 3, name: 'Third' }]),
    });

    screen.getByTestId('create-task-trigger').click();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/tasks?projectId=1', { signal: undefined });
      expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
    });
  });

  describe('Deletion Persistence Bug (Integration)', () => {
    it('allows multiple tasks to be deleted independently without timer resets', async () => {
      vi.useFakeTimers();

      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks?projectId=')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTasks) });
        }
        return Promise.resolve({ ok: true });
      });

      renderTaskList({ projectId: 1 });
      await waitFor(() => screen.getByText('First task'));

      // 1. Start deleting Task 1 at t=0
      fireEvent.click(screen.getAllByRole('button', { name: 'Delete task' })[0]);
      expect(screen.getByText('UNDO DELETION')).toBeInTheDocument();

      // 2. Advance 2 seconds
      vi.advanceTimersByTime(2000);

      // 3. Start deleting Task 2 at t=2
      const task2Container = screen.getByText('Second task').closest('.card-base');
      const deleteBtn2 = task2Container?.querySelector('button[aria-label="Delete task"]');
      if (deleteBtn2) fireEvent.click(deleteBtn2);
      expect(screen.getAllByText('UNDO DELETION')).toHaveLength(2);

      // 4. Advance 8 more seconds (t=10)
      // Task 1 should trigger its DELETE request and be removed
      vi.advanceTimersByTime(8000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/tasks/1',
          expect.objectContaining({ method: 'DELETE' }),
        );
        expect(screen.queryByText('First task')).toBeNull();
      });

      // 5. Advance 2 more seconds (t=12)
      // Task 2 should trigger its DELETE request (10s after its start at t=2)
      // If the bug exists, this would fail because the timer would have reset at t=10
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/tasks/2',
          expect.objectContaining({ method: 'DELETE' }),
        );
        expect(screen.queryByText('Second task')).toBeNull();
      });

      expect(screen.getByText('Tasks (0)')).toBeInTheDocument();
    });
  });

  describe('History Events', () => {
    it('shows refresh button when a new task is created', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      });

      const { rerender } = renderTaskList({ projectId: 1, taskUpdateEvent: null });
      await waitFor(() => screen.getByText('Tasks (2)'));

      // Simulate a create event for project 1
      const createEvent = {
        projectId: 1,
        taskId: 99,
        operation: 'create',
        timestamp: Date.now(),
      };

      rerender(
        <DeletionProvider>
          <TaskList projectId={1} taskUpdateEvent={createEvent} />
        </DeletionProvider>,
      );

      expect(screen.getByText(/1 new task available. Refresh\?/i)).toBeInTheDocument();

      // Simulate same event again - should still show "1 new task" (deduplication)
      rerender(
        <DeletionProvider>
          <TaskList projectId={1} taskUpdateEvent={{ ...createEvent, timestamp: Date.now() + 1 }} />
        </DeletionProvider>,
      );
      expect(screen.getByText(/1 new task available. Refresh\?/i)).toBeInTheDocument();

      // Click refresh
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([...mockTasks, { id: 3, name: 'Third', projectId: 1 }]),
      });

      fireEvent.click(screen.getByText(/Refresh\?/i));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/tasks?projectId=1', expect.anything());
        expect(screen.getByText('Tasks (3)')).toBeInTheDocument();
        expect(screen.queryByText(/new task available/i)).toBeNull();
      });
    });

    it('updates a task in-place when an update event is received', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      });

      const { rerender } = renderTaskList({ projectId: 1, taskUpdateEvent: null });
      await waitFor(() => screen.getByText('First task'));

      const updatedTask = { ...mockTasks[0], name: 'Updated First Task' };

      // Mock the fetch for the specific task update
      mockFetch.mockImplementation((url) => {
        if (url === '/api/tasks/1') {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(updatedTask) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTasks) });
      });

      const updateEvent = {
        projectId: 1,
        taskId: 1,
        operation: 'update',
        timestamp: Date.now(),
      };

      rerender(
        <DeletionProvider>
          <TaskList projectId={1} taskUpdateEvent={updateEvent} />
        </DeletionProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Updated First Task')).toBeInTheDocument();
        expect(screen.queryByText('First task')).toBeNull();
      });
    });
  });
});
