/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'preact/hooks';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Row } from './ui/Row';
import { Column, Columns } from './ui/Columns';
import { Text } from './ui/Text';

interface CleanupTasksDialogProps {
  projectId: number;
  onTasksCleaned: () => void;
  disabled?: boolean;
}

export function CleanupTasksDialog({
  projectId,
  onTasksCleaned,
  disabled = false,
}: CleanupTasksDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCleanup = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/cleanup?projectId=${projectId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to clean up tasks');
      }

      setOpen(false);
      onTasksCleaned();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to clean up tasks. Please try again.';
      console.error('Error cleaning up tasks:', err);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      title="Clean Up Finished Tasks"
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setError(null);
        }
      }}
      trigger={
        <Button variant="secondary" disabled={disabled} className="text-red-500 hover:text-red-600">
          Clear Finished
        </Button>
      }
    >
      <Columns vertical gap={4}>
        <Column>
          <Text>
            Are you sure you want to delete all <strong>completed</strong> and{' '}
            <strong>closed</strong> tasks?
          </Text>
          <Text small muted className="mt-2">
            This action cannot be undone.
          </Text>
        </Column>

        {error && <Text className="text-type-bug text-xs">{error}</Text>}

        <Row justify="end" gap={2}>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCleanup}
            disabled={submitting}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {submitting ? 'Clearing...' : 'Clear Finished'}
          </Button>
        </Row>
      </Columns>
    </Dialog>
  );
}
