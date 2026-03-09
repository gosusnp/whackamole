/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/preact';
import { CreateProjectDialog } from './CreateProjectDialog';
import type { ComponentChildren } from 'preact';

// Mock Radix Dialog as it causes environment issues in Vitest/Preact
vi.mock('@radix-ui/react-dialog', () => {
  return {
    Root: ({
      children,
      open,
      onOpenChange,
    }: {
      children: ComponentChildren;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => {
      return (
        <div data-testid="radix-root" data-open={open} onClick={() => onOpenChange?.(!open)}>
          {children}
        </div>
      );
    },
    Trigger: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="radix-trigger">{children}</div>
    ),
    Portal: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="radix-portal">{children}</div>
    ),
    Overlay: ({ className }: { className?: string }) => (
      <div data-testid="radix-overlay" className={className} />
    ),
    Content: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <div data-testid="radix-content" className={className}>
        {children}
      </div>
    ),
    Title: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <h2 data-testid="radix-title" className={className}>
        {children}
      </h2>
    ),
    Close: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <button data-testid="radix-close" className={className}>
        {children}
      </button>
    ),
  };
});

describe('CreateProjectDialog', () => {
  const mockOnProjectCreated = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockOnProjectCreated.mockClear();
  });

  it('renders trigger', () => {
    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);
    expect(screen.getByLabelText('Add Project')).toBeInTheDocument();
  });

  it('auto-generates slug from project name', async () => {
    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);

    const nameInput = screen.getByPlaceholderText('e.g. My Awesome Project');
    const keyInput = screen.getByPlaceholderText('e.g. my-awesome-project');

    fireEvent.input(nameInput, { target: { value: 'Hello World' } });
    expect(keyInput).toHaveValue('hello-world');
  });

  it('allows manual key override', async () => {
    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);

    const nameInput = screen.getByPlaceholderText('e.g. My Awesome Project');
    const keyInput = screen.getByPlaceholderText('e.g. my-awesome-project');

    fireEvent.input(nameInput, { target: { value: 'Hello' } });
    fireEvent.input(keyInput, { target: { value: 'custom-key' } });
    fireEvent.input(nameInput, { target: { value: 'Hello World' } });

    expect(keyInput).toHaveValue('custom-key');
  });

  it('validates slug format', async () => {
    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);

    fireEvent.input(screen.getByPlaceholderText('e.g. My Awesome Project'), {
      target: { value: 'Valid Name' },
    });
    const keyInput = screen.getByPlaceholderText('e.g. my-awesome-project');
    fireEvent.input(keyInput, { target: { value: 'Invalid Key!' } });

    const form = screen.getByPlaceholderText('e.g. My Awesome Project').closest('form');
    fireEvent.submit(form!);

    expect(screen.getByText(/Key must be lowercase/)).toBeInTheDocument();
  });

  it('submits successfully and calls onProjectCreated', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 123, name: 'Test', key: 'test' }),
    });

    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);

    fireEvent.input(screen.getByPlaceholderText('e.g. My Awesome Project'), {
      target: { value: 'Test Project' },
    });

    const form = screen.getByPlaceholderText('e.g. My Awesome Project').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Project', key: 'test-project' }),
        }),
      );
      expect(mockOnProjectCreated).toHaveBeenCalledWith('123');
    });
  });

  it('shows error message on fetch failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Key already taken'),
    });

    render(<CreateProjectDialog onProjectCreated={mockOnProjectCreated} />);
    fireEvent.input(screen.getByPlaceholderText('e.g. My Awesome Project'), {
      target: { value: 'Test' },
    });

    const form = screen.getByPlaceholderText('e.g. My Awesome Project').closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Key already taken')).toBeInTheDocument();
    });
  });
});
