/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

export type TaskType = 'feat' | 'bug' | 'docs' | 'refactor' | 'chore';
export type TaskStatus =
  | 'notStarted'
  | 'inProgress'
  | 'review'
  | 'blocked'
  | 'completed'
  | 'closed';

export interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
}

export type GlobalConfigKey = 'mcp_instructions';

export interface GlobalConfig {
  key: GlobalConfigKey;
  value: string;
}
