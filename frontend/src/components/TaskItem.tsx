/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Heading } from './ui/Heading';
import { Row } from './ui/Row';
import { Button } from './ui/Button';
import { TextArea } from './ui/TextArea';
import { Input } from './ui/Input';
import { Markdown } from './ui/Markdown';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { Edit2, Save, X } from 'lucide-preact';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSave = async () => {
    if (description === (task.description || '') && name === task.name) {
      setIsEditing(false);
      setNameError('');
      return;
    }

    if (!name.trim()) {
      setNameError('Task name cannot be empty');
      return;
    }
    setNameError('');

    setIsSaving(true);
    try {
      const updatedTask = {
        ...task,
        name: name,
        description: description,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        onUpdate(task.id, { name, description });
        setIsEditing(false);
        setNameError('');
      } else {
        console.error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(task.name);
    setDescription(task.description || '');
    setIsEditing(false);
    setNameError('');
  };

  // Header: ID and Type at Top Left, Status at Top Right
  const cardHeader = (
    <Row justify="between">
      <Row gap={2}>
        <Text muted small>
          #{task.id}
        </Text>
        <TaskTypeBadge
          task={task}
          onTypeUpdate={(newType) => onUpdate(task.id, { type: newType })}
        />
      </Row>
      <TaskStatusBadge
        task={task}
        onStatusUpdate={(newStatus) => onUpdate(task.id, { status: newStatus })}
      />
    </Row>
  );

  return (
    <Card title={cardHeader}>
      <div className="flex flex-col gap-4">
        {/* Name Row: Name + Edit Actions */}
        <Row justify="between" items="start" gap={4}>
          <div className="flex flex-1 flex-col gap-1">
            {isEditing ? (
              <>
                <Input value={name} onValueChange={setName} placeholder="Task name" />
                {nameError && (
                  <Text small muted>
                    {nameError}
                  </Text>
                )}
              </>
            ) : (
              <Heading level={3} noMargin>
                {task.name}
              </Heading>
            )}
          </div>

          <div className="flex flex-shrink-0 gap-2 pt-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label="Save task"
                >
                  <Save size={14} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                  aria-label="Cancel edit"
                >
                  <X size={14} />
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setIsEditing(true)} aria-label="Edit task">
                <Edit2 size={14} />
              </Button>
            )}
          </div>
        </Row>

        {/* Description Row */}
        <div>
          {isEditing ? (
            <TextArea
              value={description}
              onValueChange={setDescription}
              placeholder="Add description..."
            />
          ) : task.description ? (
            <Markdown content={task.description} />
          ) : (
            <Text muted>No description provided.</Text>
          )}
        </div>
      </div>
    </Card>
  );
}
