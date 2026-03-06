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

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><Text muted>Loading projects...</Text></div>;
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
