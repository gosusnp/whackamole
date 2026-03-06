/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Tabs } from '../components/ui/Tabs';
import { TaskList } from '../components/TaskList';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Row } from '../components/ui/Row';
import { Button } from '../components/ui/Button';
import { Sun, Moon } from 'lucide-preact';

interface Project {
  id: number;
  name: string;
  key: string;
}

export function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    localStorage.getItem('whack-last-project-id') || undefined,
  );

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('whack-theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleTabChange = (id: string) => {
    setSelectedProjectId(id);
    localStorage.setItem('whack-last-project-id', id);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('whack-theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

  if (loading)
    return (
      <div className="p-8">
        <Text muted>Loading projects...</Text>
      </div>
    );
  if (error)
    return (
      <div className="p-8">
        <Text muted>{error}</Text>
      </div>
    );
  if (projects.length === 0)
    return (
      <div className="p-8">
        <Text muted>No projects found.</Text>
      </div>
    );

  const tabItems = projects.map((project) => ({
    id: String(project.id),
    label: project.name,
    content: <TaskList projectId={project.id} />,
  }));

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Row justify="between" items="center" className="mb-8">
        <Row items="center" gap={4}>
          <img
            src="/favicon.png"
            alt=""
            className="h-8 w-8"
            style={{ filter: 'var(--logo-filter)' }}
          />
          <Heading level={1} noMargin>
            whackAmole
          </Heading>
        </Row>
        <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
      </Row>
      <Tabs items={tabItems} defaultValue={selectedProjectId} onValueChange={handleTabChange} />
    </div>
  );
}
