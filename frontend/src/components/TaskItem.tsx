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

interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (description === (task.description || '') && name === task.name) {
      setIsEditing(false);
      return;
    }

    if (!name.trim()) {
      alert('Task name cannot be empty');
      return;
    }

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
  };

  // Header: ID and Type at Top Left, Status at Top Right
  const cardHeader = (
    <Row justify="between">
      <Row gap={2}>
        <Text muted small>#{task.id}</Text>
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
        <Row justify="between" gap={4}>
          {isEditing ? (
            <Input value={name} onValueChange={setName} placeholder="Task name" />
          ) : (
            <Heading level={3} noMargin>{task.name}</Heading>
          )}
          
          <div className="flex gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={handleSave} disabled={isSaving}>
                  <Save size={14} />
                </Button>
                <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                  <X size={14} />
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setIsEditing(true)}>
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
          ) : (
            task.description ? (
              <Markdown content={task.description} />
            ) : (
              <Text muted>No description provided.</Text>
            )
          )}
        </div>
      </div>
    </Card>
  );
}
