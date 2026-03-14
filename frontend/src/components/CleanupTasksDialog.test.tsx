/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CleanupTasksDialog } from './CleanupTasksDialog';
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

describe('CleanupTasksDialog', () => {
  const mockOnTasksCleaned = vi.fn();
  const mockFetch = vi.fn();
  const projectId = 1;

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockOnTasksCleaned.mockClear();
    mockFetch.mockClear();
  });

  it('renders the trigger button', () => {
    render(<CleanupTasksDialog projectId={projectId} onTasksCleaned={mockOnTasksCleaned} />);
    const trigger = screen.getByTestId('radix-trigger');
    expect(within(trigger).getByText('Clear Finished')).toBeInTheDocument();
  });

  it('opens the dialog when clicking the trigger button', async () => {
    render(<CleanupTasksDialog projectId={projectId} onTasksCleaned={mockOnTasksCleaned} />);

    fireEvent.click(screen.getByTestId('radix-trigger'));

    expect(await screen.findByText('Clean Up Finished Tasks')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete all/i)).toBeInTheDocument();
  });

  it('calls the cleanup API and triggers onTasksCleaned on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<CleanupTasksDialog projectId={projectId} onTasksCleaned={mockOnTasksCleaned} />);

    // Open dialog
    fireEvent.click(screen.getByTestId('radix-trigger'));

    // Click Clear Finished button inside dialog
    const content = screen.getByTestId('radix-content');
    const cleanupButton = within(content).getByRole('button', { name: 'Clear Finished' });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/tasks/cleanup?projectId=${projectId}`, {
        method: 'DELETE',
      });
      expect(mockOnTasksCleaned).toHaveBeenCalled();
    });

    // Check if dialog is closed by verifying the root state
    expect(screen.getByTestId('radix-root')).toHaveAttribute('data-open', 'false');
  });

  it('displays an error message when the API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('Database error'),
    });

    render(<CleanupTasksDialog projectId={projectId} onTasksCleaned={mockOnTasksCleaned} />);

    // Open dialog
    fireEvent.click(screen.getByTestId('radix-trigger'));

    // Click Clear Finished button inside dialog
    const content = screen.getByTestId('radix-content');
    const cleanupButton = within(content).getByRole('button', { name: 'Clear Finished' });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });

    expect(mockOnTasksCleaned).not.toHaveBeenCalled();
  });

  it('closes the dialog when clicking cancel', async () => {
    render(<CleanupTasksDialog projectId={projectId} onTasksCleaned={mockOnTasksCleaned} />);

    // Open dialog
    fireEvent.click(screen.getByTestId('radix-trigger'));

    // Click Cancel
    const content = screen.getByTestId('radix-content');
    const cancelButton = within(content).getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByTestId('radix-root')).toHaveAttribute('data-open', 'false');
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
