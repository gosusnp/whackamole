/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import * as RadixTabs from '@radix-ui/react-tabs';
import { TaskList } from '../components/TaskList';
import { Text } from '../components/ui/Text';
import { StickyHeader } from '../components/StickyHeader';
import { CreateProjectDialog } from '../components/CreateProjectDialog';
import { DeleteProjectDialog } from '../components/DeleteProjectDialog';
import { CreateTaskDialog } from '../components/CreateTaskDialog';
import { useHeader } from '../HeaderContext';

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
  const { isCondensed } = useHeader();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(
    localStorage.getItem('whack-last-project-id') || undefined,
  );

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

  const handleProjectCreated = (newId: string) => {
    fetchProjects(newId);
  };

  const defaultTab = selectedProjectId || (projects[0]?.id ? String(projects[0].id) : undefined);

  return (
    <RadixTabs.Root
      className="tabs-root"
      value={selectedProjectId}
      onValueChange={handleTabChange}
      defaultValue={defaultTab}
    >
      <StickyHeader
        theme={theme}
        toggleTheme={toggleTheme}
        headerExtra={
          selectedProjectId && (
            <CreateTaskDialog
              projectId={Number(selectedProjectId)}
              onTaskCreated={() => {
                window.dispatchEvent(
                  new CustomEvent('whack-task-created', {
                    detail: { projectId: Number(selectedProjectId) },
                  }),
                );
              }}
            />
          )
        }
        tabsList={
          <RadixTabs.List
            className={`tabs-list tabs-list-no-margin ${isCondensed ? 'header-condensed border-none' : ''}`}
          >
            {projects.map((project) => (
              <RadixTabs.Trigger
                key={project.id}
                value={String(project.id)}
                className="tabs-trigger"
              >
                {project.name}
                <DeleteProjectDialog
                  projectId={project.id}
                  projectName={project.name}
                  onProjectDeleted={handleProjectDeleted}
                />
              </RadixTabs.Trigger>
            ))}
            <div className="flex-1" />
            {!isCondensed && (
              <div className="tabs-extra flex items-center px-2">
                <CreateProjectDialog onProjectCreated={handleProjectCreated} />
              </div>
            )}
          </RadixTabs.List>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-8 pb-8">
        {projects.length === 0 ? (
          <div className="border-border-base bg-bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-20">
            <Text muted className="mb-4">
              No projects found. Create your first project to get started.
            </Text>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        ) : (
          projects.map((project) => (
            <RadixTabs.Content
              key={project.id}
              value={String(project.id)}
              className="tabs-content w-full outline-none"
            >
              <TaskList projectId={project.id} />
            </RadixTabs.Content>
          ))
        )}
      </div>
    </RadixTabs.Root>
  );
}
