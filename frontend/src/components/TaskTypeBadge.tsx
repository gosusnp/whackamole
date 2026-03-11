/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Popover } from './ui/Popover';
import { ToggleGroup } from './ui/ToggleGroup';
import type { Task, TaskType } from '../types';

interface TaskTypeBadgeProps {
  task: Task;
  onTypeUpdate?: (newType: TaskType) => void;
}

const TYPE_OPTIONS = [
  { value: 'feat', label: 'feat' },
  { value: 'bug', label: 'bug' },
  { value: 'docs', label: 'docs' },
  { value: 'refactor', label: 'refactor' },
  { value: 'chore', label: 'chore' },
];

export function TaskTypeBadge({ task, onTypeUpdate }: TaskTypeBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = async (newType: string) => {
    if (!onTypeUpdate || newType === task.type) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);

    try {
      const updates = {
        type: newType as TaskType,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onTypeUpdate(newType as TaskType);
      } else {
        console.error('Failed to update task type');
      }
    } catch (err) {
      console.error('Error updating task type:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const trigger = (
    <button className={`btn-ghost badge-${task.type}`} disabled={isUpdating || !onTypeUpdate}>
      {task.type}
    </button>
  );

  if (!onTypeUpdate) {
    return trigger;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} trigger={trigger}>
      <ToggleGroup value={task.type} onValueChange={handleTypeChange} items={TYPE_OPTIONS} />
    </Popover>
  );
}
