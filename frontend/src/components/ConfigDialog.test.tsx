/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/preact';
import { ConfigDialog } from './ConfigDialog';
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

describe('ConfigDialog', () => {
  const mockFetch = vi.fn();
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
    consoleSpy.mockReset();
  });

  it('renders trigger', () => {
    render(<ConfigDialog />);
    expect(screen.getByLabelText('Open settings')).toBeInTheDocument();
  });

  it('fetches configs when opened', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ key: 'mcp_instructions', value: 'Hello agent' }]),
    });

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root); // simulate opening

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
      expect(screen.getByPlaceholderText(/Enter instructions/)).toHaveValue('Hello agent');
    });
  });

  it('submits successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root); // simulate opening

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
    });

    const textArea = screen.getByPlaceholderText(/Enter instructions/);
    fireEvent.input(textArea, { target: { value: 'New instructions' } });

    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/configs',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            key: 'mcp_instructions',
            value: 'New instructions',
          }),
        }),
      );
    });
  });

  it('handles fetch failure on open', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch configs', expect.any(Error));
    });
  });

  it('handles fetch not ok on open', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
    });
  });

  it('handles save failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    mockFetch.mockRejectedValueOnce(new Error('Save failed'));

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
    });

    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save config', expect.any(Error));
    });
  });

  it('handles save not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    render(<ConfigDialog />);

    const root = screen.getByTestId('radix-root');
    fireEvent.click(root);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/configs');
    });

    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
