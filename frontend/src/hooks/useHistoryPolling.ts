/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useCallback, useRef } from 'preact/hooks';
import type { History } from '../types';

export function useHistoryPolling(
  selectedProjectId: string | undefined,
  onTaskEvent: (event: {
    projectId: number;
    taskId: number;
    operation: string;
    timestamp: number;
  }) => void,
  onProjectEvent: () => void,
  onNotification: (projectId: number) => void,
) {
  const lastSyncTimestampRef = useRef<string>(new Date(Date.now() - 3600000).toISOString());
  const isPollingRef = useRef(false);

  const pollHistory = useCallback(
    async (isMounted: () => boolean) => {
      if (isPollingRef.current) return;

      isPollingRef.current = true;

      try {
        const res = await fetch(`/api/history?since=${lastSyncTimestampRef.current}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const updates = (await res.json()) as History[];

        if (!isMounted()) return;

        if (updates && updates.length > 0) {
          lastSyncTimestampRef.current = updates[updates.length - 1].createdAt;

          for (const update of updates) {
            if (update.objectType === 'task') {
              const pid = update.projectId;

              if (String(pid) === selectedProjectId) {
                onTaskEvent({
                  projectId: pid,
                  taskId: update.objectId,
                  operation: update.operation,
                  timestamp: Date.now(),
                });
              } else {
                onNotification(pid);
              }
            } else if (update.objectType === 'project') {
              onProjectEvent();
            }
          }
        }
      } catch (err) {
        console.error('Error polling history:', err);
      } finally {
        isPollingRef.current = false;
      }
    },
    [selectedProjectId, onTaskEvent, onProjectEvent, onNotification],
  );

  useEffect(() => {
    let isMounted = true;
    const checkMounted = () => isMounted;

    const interval = setInterval(() => pollHistory(checkMounted), 5000);
    pollHistory(checkMounted);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollHistory]);
}
