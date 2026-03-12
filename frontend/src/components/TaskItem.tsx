/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { memo } from 'preact/compat';
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
import { DeletionProgressBar } from './DeletionProgressBar';
import { useDeletion } from '../contexts/DeletionContext';
import { Edit2, Save, X, Trash2, Undo2, ChevronDown, ChevronUp } from 'lucide-preact';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: number, updates: Partial<Task>) => void;
  onDelete: (taskId: number) => void;
}

export const TaskItem = memo(function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { startDeletion, cancelDeletion, getDeletion } = useDeletion();
  const [isExpanded, setIsExpanded] = useState(false);

  const deletionInfo = getDeletion(task.id);
  const isDeleting = !!deletionInfo;
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [hasOverflow, setHasOverflow] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (descriptionRef.current && !isEditing) {
      const { scrollHeight, clientHeight } = descriptionRef.current;
      setHasOverflow(scrollHeight > clientHeight);
    }
  }, [task.description, isEditing, isExpanded]);

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
      const updates = {
        name: name,
        description: description,
      };

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onUpdate(task.id, updates);
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

  const handleDeleteStart = () => startDeletion(task.id, handleDeleteCommit);
  const handleDeleteCancel = () => cancelDeletion(task.id);

  const handleDeleteCommit = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      if (response.ok) {
        onDelete(task.id);
        cancelDeletion(task.id);
      } else {
        console.error('Failed to delete task');
        cancelDeletion(task.id);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      cancelDeletion(task.id);
    }
  }, [task.id, onDelete, cancelDeletion]);

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
        <Text muted small className="text-mono">
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

  const isTerminal = task.status === 'completed' || task.status === 'closed';

  return (
    <Card
      title={cardHeader}
      className={`${isDeleting ? 'card-destructive' : ''} ${isTerminal ? 'card-recession' : ''} card-type-container card-type-${task.type}`}
    >
      {' '}
      {/* Deletion Overlay: Prominent centered Undo and Top-Flush Progress */}
      {isDeleting && deletionInfo && (
        <div className="card-deletion-overlay">
          <Text className="card-deletion-text">Task will be deleted</Text>
          <Button
            variant="primary"
            onClick={handleDeleteCancel}
            aria-label="Undo delete"
            className="btn-destructive-large"
          >
            <Undo2 size={16} className="mr-2" />
            UNDO DELETION
          </Button>
          <DeletionProgressBar
            taskId={task.id}
            startTime={deletionInfo.startTime}
            onComplete={handleDeleteCommit}
            position="top"
            className="h-[3px]"
          />
        </div>
      )}
      <div className="flex flex-col gap-4">
        {/* Name Row: Name + Edit/Delete Actions */}
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
              <>
                {task.description && (hasOverflow || isExpanded) && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setIsEditing(true)} aria-label="Edit task">
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDeleteStart}
                  aria-label="Delete task"
                  className="btn-ghost-danger"
                >
                  <Trash2 size={14} />
                </Button>
              </>
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
            <div className="card-description-container">
              <div ref={descriptionRef} className={!isExpanded ? 'card-description-collapsed' : ''}>
                <Markdown content={task.description} />
              </div>
              {!isExpanded && hasOverflow && <div className="card-description-fade" />}
            </div>
          ) : (
            <Text muted>No description provided.</Text>
          )}
        </div>
      </div>
    </Card>
  );
});
