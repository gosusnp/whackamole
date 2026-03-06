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

  const fetchTasks = () => {
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
