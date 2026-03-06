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
  Tabs: ({ items }: { items: { id: string; label: string; content: unknown }[] }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} role="tab">
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

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

    expect(screen.getByText('No projects found.')).toBeInTheDocument();
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
});
