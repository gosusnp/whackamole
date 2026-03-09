/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Row } from './ui/Row';
import { Columns, Column } from './ui/Columns';
import { Text } from './ui/Text';
import { X } from 'lucide-preact';

interface DeleteProjectDialogProps {
  projectId: number;
  projectName: string;
  onProjectDeleted: (projectId: string) => void;
}

export function DeleteProjectDialog({
  projectId,
  projectName,
  onProjectDeleted,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (confirmName !== projectName) {
      setError('Project name does not match');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to delete project');
      }

      setOpen(false);
      onProjectDeleted(String(projectId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete project. Please try again.';
      console.error('Error deleting project:', err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      title="Delete Project"
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setConfirmName('');
          setError(null);
        }
      }}
      trigger={
        <button
          className="tab-delete-button"
          aria-label={`Delete ${projectName}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <X size={14} />
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Columns vertical>
          <Column>
            <Text>
              This action <strong>cannot</strong> be undone. This will permanently delete the
              project
              <strong> {projectName}</strong> and all of its tasks.
            </Text>
          </Column>
          <Column>
            <Text small bold>
              TYPE PROJECT NAME TO CONFIRM
            </Text>
            <Input
              value={confirmName}
              onValueChange={setConfirmName}
              placeholder={projectName}
              autoFocus
            />
          </Column>
        </Columns>

        {error && <Text className="text-type-bug text-xs">{error}</Text>}

        <Row justify="end" gap={2}>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={submitting || confirmName !== projectName}
            className="btn-destructive-large !px-4 !py-2 !text-sm !shadow-none"
          >
            {submitting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </Row>
      </form>
    </Dialog>
  );
}
