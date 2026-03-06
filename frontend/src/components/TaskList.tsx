/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Columns, Column } from './ui/Columns';
import { Text } from './ui/Text';
import { TaskItem } from './TaskItem';
import type { Task } from '../types';

interface TaskListProps {
  projectId: number;
}

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
      })
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please refresh.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleUpdate = (taskId: number, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  if (loading) return <Text muted>Loading tasks...</Text>;
  if (error) return <Text muted>{error}</Text>;
  if (tasks.length === 0) return <Text muted>No tasks found.</Text>;

  return (
    <Columns vertical>
      {tasks.map((task) => (
        <Column key={task.id}>
          <TaskItem task={task} onUpdate={handleUpdate} />
        </Column>
      ))}
    </Columns>
  );
}
