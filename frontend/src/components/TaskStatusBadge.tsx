/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Popover } from './ui/Popover';
import { ToggleGroup } from './ui/ToggleGroup';
import type { Task, TaskStatus } from '../types';

interface TaskStatusBadgeProps {
  task: Task;
  onStatusUpdate?: (newStatus: TaskStatus) => void;
}

const STATUS_OPTIONS = [
  { value: 'notStarted', label: 'NOT STARTED' },
  { value: 'inProgress', label: 'IN PROGRESS' },
  { value: 'review', label: 'REVIEW' },
  { value: 'blocked', label: 'BLOCKED' },
  { value: 'completed', label: 'COMPLETED' },
  { value: 'closed', label: 'CLOSED' },
];

export function TaskStatusBadge({ task, onStatusUpdate }: TaskStatusBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusUpdate || newStatus === task.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false); // Close immediately for a smoother UI

    try {
      const updates = {
        status: newStatus as TaskStatus,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onStatusUpdate(newStatus as TaskStatus);
      } else {
        console.error('Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const trigger = (
    <button
      className={`btn-ghost badge-status-${task.status}`}
      disabled={isUpdating || !onStatusUpdate}
    >
      {task.status}
    </button>
  );

  if (!onStatusUpdate) {
    return trigger;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} trigger={trigger}>
      <ToggleGroup value={task.status} onValueChange={handleStatusChange} items={STATUS_OPTIONS} />
    </Popover>
  );
}
