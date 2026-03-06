/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Popover } from './ui/Popover';
import { ToggleGroup } from './ui/ToggleGroup';
import type { Task } from '../types';

interface TaskStatusBadgeProps {
  task: Task;
  onStatusUpdate: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'notStarted', label: 'notStarted' },
  { value: 'inProgress', label: 'inProgress' },
  { value: 'blocked', label: 'blocked' },
  { value: 'completed', label: 'completed' },
  { value: 'closed', label: 'closed' },
];

export function TaskStatusBadge({ task, onStatusUpdate }: TaskStatusBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false); // Close immediately for a smoother UI

    try {
      const updates = {
        status: newStatus,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onStatusUpdate(newStatus);
      } else {
        console.error('Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <button
          className={`btn-ghost ${task.status === 'completed' ? '' : 'btn-ghost-active'}`}
          disabled={isUpdating}
        >
          {task.status}
        </button>
      }
    >
      <ToggleGroup value={task.status} onValueChange={handleStatusChange} items={STATUS_OPTIONS} />
    </Popover>
  );
}
