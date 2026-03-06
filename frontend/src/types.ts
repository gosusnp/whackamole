/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

export interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  type: string;
  status: string;
}
