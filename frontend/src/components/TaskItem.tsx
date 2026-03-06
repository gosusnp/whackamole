/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { TextArea } from './ui/TextArea';
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
  const [description, setDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (description === (task.description || '')) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedTask = {
        ...task,
        description: description,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        onUpdate(task.id, { description });
        setIsEditing(false);
      } else {
        console.error('Failed to update task description');
      }
    } catch (err) {
      console.error('Error updating task description:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription(task.description || '');
    setIsEditing(false);
  };

  const cardTitle = (
    <div className="flex w-full justify-between items-center">
      <h3 className="card-title">{task.name}</h3>
      <div className="flex gap-2">
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
    </div>
  );

  return (
    <Card title={cardTitle}>
      <div className="flex flex-col gap-3">
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
        
        <div className="flex items-center gap-3">
          <TaskTypeBadge 
            task={task} 
            onTypeUpdate={(newType) => onUpdate(task.id, { type: newType })}
          />
          <div className="w-px h-3 bg-border-base" />
          <TaskStatusBadge 
            task={task} 
            onStatusUpdate={(newStatus) => onUpdate(task.id, { status: newStatus })}
          />
        </div>
      </div>
    </Card>
  );
}
