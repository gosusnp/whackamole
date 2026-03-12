/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { Columns, Column } from './ui/Columns';
import { Text } from './ui/Text';
import { Row } from './ui/Row';
import { Heading } from './ui/Heading';
import { Button } from './ui/Button';
import { TaskItem } from './TaskItem';
import { CreateTaskDialog } from './CreateTaskDialog';
import type { Task } from '../types';

interface TaskListProps {
  projectId: number;
  taskUpdateEvent?: {
    projectId: number;
    taskId: number;
    operation: string;
    timestamp: number;
  } | null;
}

export function TaskList({ projectId, taskUpdateEvent }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<number>>(new Set());

  const fetchTasks = (signal?: AbortSignal) => {
    // We only show loading on initial fetch
    if (tasks.length === 0) setLoading(true);
    setError(null);
    fetch(`/api/tasks?projectId=${projectId}`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      })
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
        setPendingTaskIds(new Set());
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please refresh.');
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [projectId]);

  useEffect(() => {
    if (taskUpdateEvent && taskUpdateEvent.projectId === projectId) {
      if (taskUpdateEvent.operation === 'update') {
        // Update task in-place
        fetch(`/api/tasks/${taskUpdateEvent.taskId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((updatedTask) => {
            if (updatedTask) {
              setTasks((prev) =>
                prev.some((t) => t.id === updatedTask.id)
                  ? prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
                  : [updatedTask, ...prev],
              );
            }
          })
          .catch((err) => console.error('Error fetching updated task:', err));
      } else if (taskUpdateEvent.operation === 'create') {
        setPendingTaskIds((prev) => {
          const next = new Set(prev);
          next.add(taskUpdateEvent.taskId);
          return next;
        });
      } else if (taskUpdateEvent.operation === 'delete') {
        setTasks((prev) => prev.filter((t) => t.id !== taskUpdateEvent.taskId));
      }
    }
  }, [taskUpdateEvent, projectId]);

  const handleUpdate = useCallback((taskId: number, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    );
  }, []);

  const handleDelete = useCallback((taskId: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  }, []);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  if (loading) return <Text muted>Loading tasks...</Text>;
  if (error) return <Text muted>{error}</Text>;

  return (
    <Columns vertical gap={6}>
      <Row justify="between" items="center">
        <Row items="center" gap={4} fullWidth={false}>
          <Heading level={2} noMargin>
            Tasks ({tasks.length})
          </Heading>
          {pendingTaskIds.size > 0 && (
            <Button variant="ghost" onClick={() => fetchTasks()} className="text-primary underline">
              {pendingTaskIds.size} new task{pendingTaskIds.size > 1 ? 's' : ''} available. Refresh?
            </Button>
          )}
        </Row>
        <CreateTaskDialog projectId={projectId} onTaskCreated={handleTaskCreated} />
      </Row>

      {tasks.length === 0 ? (
        <Text muted>No tasks found.</Text>
      ) : (
        <Columns vertical gap={4}>
          {tasks.map((task) => (
            <Column key={task.id}>
              <TaskItem task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
            </Column>
          ))}
        </Columns>
      )}
    </Columns>
  );
}
