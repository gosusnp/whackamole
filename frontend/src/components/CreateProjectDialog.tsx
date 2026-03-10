/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from 'preact/hooks';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Row } from './ui/Row';
import { Columns, Column } from './ui/Columns';
import { Text } from './ui/Text';
import { Plus } from 'lucide-preact';

interface CreateProjectDialogProps {
  onProjectCreated: (projectId: string) => void;
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [isKeyModified, setIsKeyModified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    if (!isKeyModified) {
      setKey(slugify(name));
    }
  }, [name, isKeyModified]);

  const handleKeyChange = (val: string) => {
    setKey(val.toLowerCase().replace(/\s+/g, '-'));
    setIsKeyModified(true);
  };

  const validateKey = (val: string) => {
    return /^[a-z0-9-]+$/.test(val);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!key.trim()) {
      setError('Project key is required');
      return;
    }

    if (!validateKey(key)) {
      setError('Key must be lowercase, alphanumeric, and may contain dashes');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          key: key.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to create project');
      }

      const newProject = await res.json();

      setName('');
      setKey('');
      setIsKeyModified(false);
      setOpen(false);
      onProjectCreated(String(newProject.id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create project. Please try again.';
      console.error('Error creating project:', err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      title="Create New Project"
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setName('');
          setKey('');
          setIsKeyModified(false);
          setError(null);
        }
      }}
      trigger={
        <button className="tabs-trigger flex items-center justify-center" aria-label="Add Project">
          <Plus size={16} />
        </button>
      }
    >
      <form onSubmit={handleSubmit}>
        <Columns vertical gap={4}>
          <Column>
            <Text small bold>
              PROJECT NAME
            </Text>
            <Input
              value={name}
              onValueChange={setName}
              placeholder="e.g. My Awesome Project"
              autoFocus
            />
          </Column>
          <Column>
            <Text small bold>
              PROJECT KEY
            </Text>
            <Input
              value={key}
              onValueChange={handleKeyChange}
              placeholder="e.g. my-awesome-project"
            />
            <Text small muted className="mt-1">
              Used for routing and database lookups. Must be slug-like.
            </Text>
          </Column>

          {error && <Text className="text-type-bug text-xs">{error}</Text>}

          <Row justify="end" gap={2}>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </Row>
        </Columns>
      </form>
    </Dialog>
  );
}
