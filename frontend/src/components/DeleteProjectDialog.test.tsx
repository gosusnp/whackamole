/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/preact';
import { DeleteProjectDialog } from './DeleteProjectDialog';
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

describe('DeleteProjectDialog', () => {
  const mockOnProjectDeleted = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockOnProjectDeleted.mockClear();
    mockFetch.mockClear();
  });

  it('renders trigger with correct label', () => {
    render(
      <DeleteProjectDialog
        projectId={1}
        projectName="Test Project"
        onProjectDeleted={mockOnProjectDeleted}
      />,
    );
    expect(screen.getByLabelText('Delete Test Project')).toBeInTheDocument();
  });

  it('requires typing project name to enable delete button', async () => {
    render(
      <DeleteProjectDialog
        projectId={1}
        projectName="Test Project"
        onProjectDeleted={mockOnProjectDeleted}
      />,
    );

    // Opening dialog
    const trigger = screen.getByLabelText('Delete Test Project');
    fireEvent.click(trigger);

    const input = screen.getByPlaceholderText('Test Project');
    const deleteButton = screen.getByRole('button', { name: 'Delete Project' });

    expect(deleteButton).toBeDisabled();

    fireEvent.input(input, { target: { value: 'Wrong Name' } });
    expect(deleteButton).toBeDisabled();

    fireEvent.input(input, { target: { value: 'Test Project' } });
    expect(deleteButton).not.toBeDisabled();
  });

  it('submits successfully and calls onProjectDeleted', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
    });

    render(
      <DeleteProjectDialog
        projectId={1}
        projectName="Test Project"
        onProjectDeleted={mockOnProjectDeleted}
      />,
    );

    // Opening dialog
    fireEvent.click(screen.getByLabelText('Delete Test Project'));

    const input = screen.getByPlaceholderText('Test Project');
    fireEvent.input(input, { target: { value: 'Test Project' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/projects/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
      expect(mockOnProjectDeleted).toHaveBeenCalledWith('1');
    });
  });

  it('shows error message on fetch failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Forbidden'),
    });

    render(
      <DeleteProjectDialog
        projectId={1}
        projectName="Test Project"
        onProjectDeleted={mockOnProjectDeleted}
      />,
    );

    fireEvent.click(screen.getByLabelText('Delete Test Project'));
    const input = screen.getByPlaceholderText('Test Project');
    fireEvent.input(input, { target: { value: 'Test Project' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Forbidden')).toBeInTheDocument();
    });
  });
});
