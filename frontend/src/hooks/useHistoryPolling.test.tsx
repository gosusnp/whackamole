/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/preact';
import { useHistoryPolling } from './useHistoryPolling';

function TestComponent({
  selectedProjectId,
  onTaskEvent,
  onProjectEvent,
  onNotification,
}: {
  selectedProjectId: string | undefined;
  onTaskEvent: (event: {
    projectId: number;
    taskId: number;
    operation: string;
    timestamp: number;
  }) => void;
  onProjectEvent: () => void;
  onNotification: (projectId: number) => void;
}) {
  useHistoryPolling(selectedProjectId, onTaskEvent, onProjectEvent, onNotification);
  return null;
}

describe('useHistoryPolling', () => {
  const mockFetch = vi.fn();
  const onTaskEvent = vi.fn();
  const onProjectEvent = vi.fn();
  const onNotification = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('polls history immediately and then every 5 seconds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <TestComponent
        selectedProjectId="1"
        onTaskEvent={onTaskEvent}
        onProjectEvent={onProjectEvent}
        onNotification={onNotification}
      />,
    );

    // Initial immediate poll
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history?since='));

    mockFetch.mockClear();

    // Advance 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history?since='));
  });

  it('triggers onNotification for task events in other projects', async () => {
    const mockHistory = [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        objectType: 'task',
        objectId: 10,
        operation: 'update',
      },
    ];
    const mockTask = { id: 10, projectId: 2 };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      }) // initial poll
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory),
      }) // second poll
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      }); // task fetch

    render(
      <TestComponent
        selectedProjectId="1"
        onTaskEvent={onTaskEvent}
        onProjectEvent={onProjectEvent}
        onNotification={onNotification}
      />,
    );

    // Advance 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(onNotification).toHaveBeenCalledWith(2);
    expect(onTaskEvent).not.toHaveBeenCalled();
  });

  it('triggers onTaskEvent for task events in the selected project', async () => {
    const mockHistory = [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        objectType: 'task',
        objectId: 10,
        operation: 'update',
      },
    ];
    const mockTask = { id: 10, projectId: 1 };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      }) // initial poll
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory),
      }) // second poll
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      }); // task fetch

    render(
      <TestComponent
        selectedProjectId="1"
        onTaskEvent={onTaskEvent}
        onProjectEvent={onProjectEvent}
        onNotification={onNotification}
      />,
    );

    // Advance 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(onTaskEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 1,
        taskId: 10,
        operation: 'update',
      }),
    );
    expect(onNotification).not.toHaveBeenCalled();
  });

  it('triggers onProjectEvent for project events', async () => {
    const mockHistory = [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        objectType: 'project',
        objectId: 2,
        operation: 'update',
      },
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      }) // initial poll
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory),
      }); // second poll

    render(
      <TestComponent
        selectedProjectId="1"
        onTaskEvent={onTaskEvent}
        onProjectEvent={onProjectEvent}
        onNotification={onNotification}
      />,
    );

    // Advance 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(onProjectEvent).toHaveBeenCalled();
  });
});
