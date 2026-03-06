/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Columns, Column } from './ui/Columns';
import { Text } from './ui/Text';
import { Row } from './ui/Row';
import { Heading } from './ui/Heading';
import { TaskItem } from './TaskItem';
import { CreateTaskDialog } from './CreateTaskDialog';
import type { Task } from '../types';

interface TaskListProps {
  projectId: number;
}

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpdate = (taskId: number, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    );
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  if (loading) return <Text muted>Loading tasks...</Text>;
  if (error) return <Text muted>{error}</Text>;

  return (
    <div className="space-y-6">
      <Row justify="between" items="center">
        <Heading level={2} noMargin>
          Tasks ({tasks.length})
        </Heading>
        <CreateTaskDialog projectId={projectId} onTaskCreated={handleTaskCreated} />
      </Row>

      {tasks.length === 0 ? (
        <Text muted>No tasks found.</Text>
      ) : (
        <Columns vertical>
          {tasks.map((task) => (
            <Column key={task.id}>
              <TaskItem task={task} onUpdate={handleUpdate} />
            </Column>
          ))}
        </Columns>
      )}
    </div>
  );
}
