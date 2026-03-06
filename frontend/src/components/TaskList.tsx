/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Card } from '../components/ui/Card';
import { Columns, Column } from '../components/ui/Columns';
import { Text } from '../components/ui/Text';
import { Markdown } from '../components/ui/Markdown';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskTypeBadge } from './TaskTypeBadge';

interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

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

  const handleStatusUpdate = (taskId: number, newStatus: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTypeUpdate = (taskId: number, newType: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, type: newType } : task
      )
    );
  };

  if (loading) return <Text muted>Loading tasks...</Text>;
  if (tasks.length === 0) return <Text muted>No tasks found.</Text>;

  return (
    <Columns vertical>
      {tasks.map((task) => (
        <Column key={task.id}>
          <Card title={task.name}>
            <div className="flex flex-col gap-3">
              <Markdown content={task.description} />
              <div className="flex items-center gap-3">
                <TaskTypeBadge 
                  task={task} 
                  onTypeUpdate={(newType) => handleTypeUpdate(task.id, newType)}
                />
                <div className="w-px h-3 bg-border-base" />
                <TaskStatusBadge 
                  task={task} 
                  onStatusUpdate={(newStatus) => handleStatusUpdate(task.id, newStatus)}
                />
              </div>
            </div>
          </Card>
        </Column>
      ))}
    </Columns>
  );
}
