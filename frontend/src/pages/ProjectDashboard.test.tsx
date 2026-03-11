/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/preact';
import { ProjectDashboard } from './ProjectDashboard';
import { HeaderProvider } from '../HeaderContext';
import { createContext, type ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

const TabsContext = createContext<{ value?: string; onValueChange?: (v: string) => void }>({});

vi.mock('@radix-ui/react-tabs', () => {
  return {
    Root: ({
      children,
      value,
      onValueChange,
    }: {
      children: ComponentChildren;
      value?: string;
      onValueChange?: (v: string) => void;
    }) => (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div data-testid="tabs-root">{children}</div>
      </TabsContext.Provider>
    ),
    List: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="tabs-list">{children}</div>
    ),
    Trigger: ({ children, value }: { children: ComponentChildren; value: string }) => {
      const { value: selectedValue, onValueChange } = useContext(TabsContext);
      return (
        <button
          role="tab"
          data-state={selectedValue === value ? 'active' : 'inactive'}
          onClick={() => onValueChange?.(value)}
        >
          {children}
        </button>
      );
    },
    Content: ({ children, value }: { children: ComponentChildren; value: string }) => {
      const { value: selectedValue } = useContext(TabsContext);
      if (selectedValue !== value) return null;
      return (
        <div data-testid="tabs-content" data-value={value}>
          {children}
        </div>
      );
    },
  };
});

vi.mock('../components/StickyHeader', () => ({
  StickyHeader: ({
    tabsList,
    headerExtra,
  }: {
    tabsList: ComponentChildren;
    headerExtra: ComponentChildren;
  }) => (
    <div data-testid="sticky-header">
      {tabsList}
      {headerExtra}
    </div>
  ),
}));

vi.mock('../components/TaskList', () => ({
  TaskList: ({ projectId }: { projectId: number }) => (
    <div data-testid="task-list" data-project-id={projectId} />
  ),
}));

vi.mock('../components/CreateProjectDialog', () => ({
  CreateProjectDialog: () => <div data-testid="create-project-dialog" />,
}));

vi.mock('../components/DeleteProjectDialog', () => ({
  DeleteProjectDialog: () => <div data-testid="delete-project-dialog" />,
}));

vi.mock('../components/CreateTaskDialog', () => ({
  CreateTaskDialog: () => <div data-testid="create-task-dialog" />,
}));

vi.mock('../components/ConfigDialog', () => ({
  ConfigDialog: () => <div data-testid="config-dialog" />,
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
    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders a tab for each project', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );

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

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/No projects found/)).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('create-project-dialog').length).toBeGreaterThan(0);
  });

  it('shows error state when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('shows error when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
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

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('data-state', 'active');
    });
  });

  it('saves selected project to localStorage on change', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProjects),
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <HeaderProvider>
        <ProjectDashboard />
      </HeaderProvider>,
    );

    await waitFor(() => screen.getByRole('tab', { name: 'Beta' }));
    act(() => {
      screen.getByRole('tab', { name: 'Beta' }).click();
    });

    expect(setItemSpy).toHaveBeenCalledWith('whack-last-project-id', '2');
  });
});
