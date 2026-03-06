/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

export type TaskType = 'feat' | 'fix' | 'bug' | 'docs' | 'refactor' | 'chore';
export type TaskStatus = 'notStarted' | 'inProgress' | 'blocked' | 'completed' | 'closed';

export interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
}
