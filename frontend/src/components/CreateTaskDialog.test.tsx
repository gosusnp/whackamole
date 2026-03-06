/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import type { ComponentChildren } from 'preact';
import { CreateTaskDialog } from './CreateTaskDialog';

// Mock UI components that might use Radix or cause issues
vi.mock('./ui/Input', () => ({
  Input: ({
    value,
    onValueChange,
    placeholder,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <input
      value={value}
      onInput={(e: Event) => onValueChange((e.target as HTMLInputElement).value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('./ui/TextArea', () => ({
  TextArea: ({
    value,
    onValueChange,
    placeholder,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      value={value}
      onInput={(e: Event) => onValueChange((e.target as HTMLTextAreaElement).value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('./ui/ToggleGroup', () => ({
  ToggleGroup: ({
    items,
    value,
    onValueChange,
  }: {
    items: { value: string; label: string }[];
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div>
      {items.map((item: { value: string; label: string }) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          aria-pressed={value === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

// Mock Radix UI Dialog
vi.mock('./ui/Dialog', () => {
  return {
    Dialog: ({
      children,
      open,
      onOpenChange,
      title,
      trigger,
    }: {
      children: ComponentChildren;
      open: boolean;
      onOpenChange: (v: boolean) => void;
      title?: string;
      trigger?: ComponentChildren;
    }) => {
      return (
        <div data-testid="mock-dialog">
          <div data-testid="dialog-title">{title}</div>
          <div data-testid="dialog-trigger-wrapper" onClick={() => onOpenChange?.(true)}>
            {trigger}
          </div>
          {open && (
            <div data-testid="dialog-content">
              {children}
              <button data-testid="dialog-close" onClick={() => onOpenChange?.(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      );
    },
  };
});

describe('CreateTaskDialog', () => {
  const mockFetch = vi.fn();
  const mockOnTaskCreated = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renders trigger', () => {
    render(<CreateTaskDialog projectId={1} onTaskCreated={mockOnTaskCreated} />);
    expect(screen.getByRole('button', { name: /new task/i })).toBeInTheDocument();
  });

  it('opens dialog and submits successfully', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    render(<CreateTaskDialog projectId={1} onTaskCreated={mockOnTaskCreated} />);

    // Open
    await act(async () => {
      await user.click(screen.getByTestId('dialog-trigger-wrapper'));
    });
    await waitFor(() => expect(screen.getByTestId('dialog-content')).toBeInTheDocument());

    // Fill
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'New Task');
    await user.click(screen.getByText('Fix'));

    // Submit
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      expect(mockOnTaskCreated).toHaveBeenCalled();
      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
    });
  });

  it('shows validation error', async () => {
    const user = userEvent.setup();
    render(<CreateTaskDialog projectId={1} onTaskCreated={mockOnTaskCreated} />);

    await act(async () => {
      await user.click(screen.getByTestId('dialog-trigger-wrapper'));
    });
    await waitFor(() => expect(screen.getByTestId('dialog-content')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByText(/task name is required/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows fetch error', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({ ok: false });

    render(<CreateTaskDialog projectId={1} onTaskCreated={mockOnTaskCreated} />);

    await act(async () => {
      await user.click(screen.getByTestId('dialog-trigger-wrapper'));
    });
    await waitFor(() => expect(screen.getByTestId('dialog-content')).toBeInTheDocument());
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'Fail Task');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });
});
