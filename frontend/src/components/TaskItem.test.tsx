/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';

vi.mock('./TaskStatusBadge', () => ({
  TaskStatusBadge: ({ task }: { task: Task }) => (
    <div data-testid="status-badge">{task.status}</div>
  ),
}));

vi.mock('./TaskTypeBadge', () => ({
  TaskTypeBadge: ({ task }: { task: Task }) => <div data-testid="type-badge">{task.type}</div>,
}));

vi.mock('./ui/Markdown', () => ({
  Markdown: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));

const mockTask: Task = {
  id: 1,
  projectId: 1,
  name: 'Test task',
  description: 'Some description',
  type: 'feat',
  status: 'notStarted',
};

describe('TaskItem', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the task name', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('renders the task description', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    expect(screen.getByTestId('markdown')).toHaveTextContent('Some description');
  });

  it('shows placeholder when description is empty', () => {
    const task = { ...mockTask, description: '' };
    render(<TaskItem task={task} onUpdate={vi.fn()} />);
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('shows the edit button', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Edit task' })).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));
    expect(screen.getByDisplayValue('Test task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Some description')).toBeInTheDocument();
  });

  it('shows save and cancel buttons in edit mode', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));
    expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel edit' })).toBeInTheDocument();
  });

  it('restores original values and exits edit mode on cancel', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));

    fireEvent.input(screen.getByDisplayValue('Test task'), { target: { value: 'Changed name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed name')).toBeNull();
  });

  it('calls fetch and onUpdate when saved with changes', async () => {
    const onUpdate = vi.fn();
    render(<TaskItem task={mockTask} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));

    fireEvent.input(screen.getByDisplayValue('Test task'), { target: { value: 'Updated name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Updated name',
            description: 'Some description',
          }),
        }),
      );
      // Verify no other fields like status or type are leaked into the body
      const lastCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(lastCallBody).not.toHaveProperty('status');
      expect(lastCallBody).not.toHaveProperty('type');
      expect(lastCallBody).not.toHaveProperty('id');

      expect(onUpdate).toHaveBeenCalledWith(mockTask.id, {
        name: 'Updated name',
        description: 'Some description',
      });
    });
  });

  it('does not call fetch when saved with no changes', async () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('shows inline validation error when name is cleared', () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));

    fireEvent.input(screen.getByDisplayValue('Test task'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    expect(screen.getByText('Task name cannot be empty')).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('exits edit mode after successful save', async () => {
    render(<TaskItem task={mockTask} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }));

    fireEvent.input(screen.getByDisplayValue('Test task'), { target: { value: 'New name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Save task' })).toBeNull();
    });
  });
});
