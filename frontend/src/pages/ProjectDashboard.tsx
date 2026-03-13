/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import { Tabs } from '../components/ui/Tabs';
import { TaskList } from '../components/TaskList';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Row } from '../components/ui/Row';
import { Button } from '../components/ui/Button';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { DeleteProjectDialog } from '../components/DeleteProjectDialog';
import { ConfigDialog } from '../components/ConfigDialog';
import { Dialog } from '../components/ui/Dialog';
import { WhacAMole } from '../components/WhacAMole';
import { Sun, Moon } from 'lucide-preact';
import { useHistoryPolling } from '../hooks/useHistoryPolling';

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
  const [notifications, setNotifications] = useState<Record<number, number>>({});
  const [taskUpdateEvent, setTaskUpdateEvent] = useState<{
    projectId: number;
    taskId: number;
    operation: string;
    timestamp: number;
  } | null>(null);
  const [isGameOpen, setIsGameOpen] = useState(false);

  const fetchProjects = useCallback(
    async (selectId?: string) => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        const projectList = (data || []) as Project[];
        setProjects(projectList);

        if (selectId) {
          setSelectedProjectId(selectId);
          localStorage.setItem('whack-last-project-id', selectId);
        } else if (projectList.length > 0) {
          // If the currently selected project is gone, or nothing is selected, select the first one
          const currentExists = projectList.some((p) => String(p.id) === selectedProjectId);
          if (!currentExists || !selectedProjectId) {
            const firstId = String(projectList[0].id);
            setSelectedProjectId(firstId);
            localStorage.setItem('whack-last-project-id', firstId);
          }
        } else {
          setSelectedProjectId(undefined);
          localStorage.removeItem('whack-last-project-id');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please refresh.');
        setLoading(false);
      }
    },
    [selectedProjectId],
  );

  const handleTaskEvent = useCallback(
    (event: { projectId: number; taskId: number; operation: string; timestamp: number }) => {
      setTaskUpdateEvent(event);
    },
    [],
  );

  const handleProjectEvent = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleNotification = useCallback((pid: number) => {
    setNotifications((prev) => ({
      ...prev,
      [pid]: (prev[pid] || 0) + 1,
    }));
  }, []);

  useHistoryPolling(selectedProjectId, handleTaskEvent, handleProjectEvent, handleNotification);

  // Reset notifications for current project
  useEffect(() => {
    if (selectedProjectId) {
      setNotifications((prev) => {
        if (!prev[Number(selectedProjectId)]) return prev;
        const next = { ...prev };
        delete next[Number(selectedProjectId)];
        return next;
      });
    }
  }, [selectedProjectId]);

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
    fetchProjects();
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

  const handleProjectDeleted = () => {
    fetchProjects();
  };

  const tabItems = projects.map((project) => ({
    id: String(project.id),
    label: project.name,
    notificationCount: notifications[project.id],
    content: <TaskList projectId={project.id} taskUpdateEvent={taskUpdateEvent} />,
    extra: (
      <DeleteProjectDialog
        projectId={project.id}
        projectName={project.name}
        onProjectDeleted={handleProjectDeleted}
      />
    ),
  }));

  const handleProjectCreated = (newId: string) => {
    fetchProjects(newId);
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Row justify="between" items="center" className="mb-8">
        <div
          className="cursor-pointer select-none"
          role="button"
          aria-label="Play Whac-A-Mole"
          onClick={() => setIsGameOpen(true)}
        >
          <Row items="center" gap={4} fullWidth={false}>
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
        </div>
        <div className="flex-1" />
        <Row items="center" gap={2} fullWidth={false}>
          <ConfigDialog />
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
        </Row>
      </Row>

      <Dialog open={isGameOpen} onOpenChange={setIsGameOpen} title="Whac-A-Mole!">
        <WhacAMole key={isGameOpen ? 'open' : 'closed'} />
      </Dialog>

      {projects.length === 0 ? (
        <div className="border-border-base bg-bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-20">
          <Text muted className="mb-4">
            No projects found. Create your first project to get started.
          </Text>
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>
      ) : (
        <Tabs
          items={tabItems}
          value={selectedProjectId}
          onValueChange={handleTabChange}
          headerExtra={<CreateProjectDialog onProjectCreated={handleProjectCreated} />}
        />
      )}
    </div>
  );
}
