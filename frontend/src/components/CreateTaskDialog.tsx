/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Row } from './ui/Row';
import { Columns, Column } from './ui/Columns';
import { ToggleGroup } from './ui/ToggleGroup';
import { Text } from './ui/Text';
import { Plus } from 'lucide-preact';
import type { TaskType } from '../types';

interface CreateTaskDialogProps {
  projectId: number;
  onTaskCreated: () => void;
}

export function CreateTaskDialog({ projectId, onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('feat');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: name.trim(),
          description: description.trim(),
          type,
          status: 'notStarted',
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      setName('');
      setDescription('');
      setType('feat');
      setOpen(false);
      onTaskCreated();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      title="Create New Task"
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setName('');
          setDescription('');
          setType('feat');
          setError(null);
        }
      }}
      trigger={
        <Button variant="primary">
          <Row gap={2} items="center">
            <Plus size={16} />
            New Task
          </Row>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Columns vertical>
          <Column>
            <Text small bold>
              NAME
            </Text>
            <Input value={name} onValueChange={setName} placeholder="What needs to be done?" />
          </Column>
          <Column>
            <Text small bold>
              TYPE
            </Text>
            <ToggleGroup
              value={type}
              onValueChange={(val) => setType(val as TaskType)}
              items={[
                { value: 'feat', label: 'Feat' },
                { value: 'fix', label: 'Fix' },
                { value: 'bug', label: 'Bug' },
                { value: 'docs', label: 'Docs' },
                { value: 'refactor', label: 'Refactor' },
                { value: 'chore', label: 'Chore' },
              ]}
            />
          </Column>
          <Column>
            <Text small bold>
              DESCRIPTION (OPTIONAL)
            </Text>
            <TextArea
              value={description}
              onValueChange={setDescription}
              placeholder="Provide more context..."
              rows={4}
            />
          </Column>
        </Columns>

        {error && <Text className="text-type-bug text-xs">{error}</Text>}

        <Row justify="end" gap={2}>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Task'}
          </Button>
        </Row>
      </form>
    </Dialog>
  );
}
