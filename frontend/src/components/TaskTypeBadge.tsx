/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Popover } from './ui/Popover';
import { ToggleGroup } from './ui/ToggleGroup';
import type { Task } from '../types';

interface TaskTypeBadgeProps {
  task: Task;
  onTypeUpdate: (newType: string) => void;
}

const TYPE_OPTIONS = [
  { value: 'feat', label: 'feat' },
  { value: 'fix', label: 'fix' },
  { value: 'bug', label: 'bug' },
  { value: 'docs', label: 'docs' },
  { value: 'refactor', label: 'refactor' },
  { value: 'chore', label: 'chore' },
];

export function TaskTypeBadge({ task, onTypeUpdate }: TaskTypeBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = async (newType: string) => {
    if (newType === task.type) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);

    try {
      const updatedTask = {
        ...task,
        type: newType,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        onTypeUpdate(newType);
      } else {
        console.error('Failed to update task type');
      }
    } catch (err) {
      console.error('Error updating task type:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <button className="btn-ghost" disabled={isUpdating}>
          {task.type}
        </button>
      }
    >
      <ToggleGroup value={task.type} onValueChange={handleTypeChange} items={TYPE_OPTIONS} />
    </Popover>
  );
}
