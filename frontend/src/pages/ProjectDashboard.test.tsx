/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/preact';
import { ProjectDashboard } from './ProjectDashboard';

vi.mock('../components/TaskList', () => ({
  TaskList: ({ projectId }: { projectId: number }) => (
    <div data-testid="task-list" data-project-id={projectId} />
  ),
}));

vi.mock('../components/ui/Tabs', () => ({
  Tabs: ({
    items,
    onValueChange,
    value,
  }: {
    items: { id: string; label: string; content: unknown; notificationCount?: number }[];
    onValueChange?: (id: string) => void;
    value?: string;
  }) => (
    <div>
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          onClick={() => onValueChange?.(item.id)}
          aria-selected={value === item.id}
        >
          {item.label}
          {item.notificationCount ? ` (${item.notificationCount})` : ''}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/CreateProjectDialog', () => ({
  CreateProjectDialog: () => <div data-testid="create-project-dialog" />,
}));

vi.mock('../components/ConfigDialog', () => ({
  ConfigDialog: () => <div data-testid="config-dialog" />,
}));

vi.mock('../hooks/useHistoryPolling', () => ({
  useHistoryPolling: vi.fn(),
}));

import { useHistoryPolling } from '../hooks/useHistoryPolling';

const mockProjects = [
  { id: 1, name: 'Alpha', key: 'alpha' },
  { id: 2, name: 'Beta', key: 'beta' },
];

describe('ProjectDashboard', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<ProjectDashboard />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders a tab for each project', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });

    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Beta' })).toBeInTheDocument();
    });
  });

  it('shows empty state when no projects exist', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<ProjectDashboard />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(screen.getByText(/No projects found/)).toBeInTheDocument();
    expect(screen.getByTestId('create-project-dialog')).toBeInTheDocument();
  });

  it('shows error state when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ProjectDashboard />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows error when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(<ProjectDashboard />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('initializes selected project from localStorage', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'whack-last-project-id') return '2';
      return null;
    });

    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('saves selected project to localStorage on change', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(<ProjectDashboard />);

    await waitFor(() => screen.getByRole('tab', { name: 'Beta' }));
    act(() => {
      screen.getByRole('tab', { name: 'Beta' }).click();
    });

    expect(setItemSpy).toHaveBeenCalledWith('whack-last-project-id', '2');
  });

  it('updates notifications for other projects via useHistoryPolling', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });

    let capturedOnNotification: (pid: number) => void = () => {};
    vi.mocked(useHistoryPolling).mockImplementation((_sid, _ote, _ope, onNotification) => {
      capturedOnNotification = onNotification;
    });

    render(<ProjectDashboard />);

    await waitFor(() => expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument());

    // Trigger notification manually via captured callback
    act(() => {
      capturedOnNotification(2);
    });

    // Check if notification badge is rendered (as text in our mock)
    expect(screen.getByRole('tab', { name: 'Beta (1)' })).toBeInTheDocument();
  });
});
