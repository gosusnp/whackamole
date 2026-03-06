/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface ColumnsProps {
  children: ComponentChildren;
  vertical?: boolean;
}

export function Columns({ children, vertical = false }: ColumnsProps) {
  const className = vertical ? 'layout-columns layout-columns-vertical' : 'layout-columns';
  return <div className={className}>{children}</div>;
}

interface ColumnProps {
  children: ComponentChildren;
}

export function Column({ children }: ColumnProps) {
  return <div className="column-flex">{children}</div>;
}
