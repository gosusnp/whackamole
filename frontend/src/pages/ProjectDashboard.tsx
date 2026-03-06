/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Tabs } from '../components/ui/Tabs';
import { TaskList } from '../components/TaskList';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';

interface Project {
  id: number;
  name: string;
  key: string;
}

export function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/projects', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please refresh.');
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) return <div className="p-8"><Text muted>Loading projects...</Text></div>;
  if (error) return <div className="p-8"><Text muted>{error}</Text></div>;
  if (projects.length === 0) return <div className="p-8"><Text muted>No projects found.</Text></div>;

  const tabItems = projects.map((project) => ({
    id: String(project.id),
    label: project.name,
    content: <TaskList projectId={project.id} />,
  }));

  return (
    <div className="p-8">
      <Heading level={1}>whackAmole</Heading>
      <Tabs items={tabItems} />
    </div>
  );
}
