/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface ColumnsProps {
  children: ComponentChildren;
  vertical?: boolean;
  className?: string;
}

export function Columns({ children, vertical = false, className: extraClassName }: ColumnsProps) {
  const baseClassName = vertical ? 'layout-columns layout-columns-vertical' : 'layout-columns';
  const fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;
  return <div className={fullClassName}>{children}</div>;
}

interface ColumnProps {
  children: ComponentChildren;
  className?: string;
}

export function Column({ children, className: extraClassName }: ColumnProps) {
  const baseClassName = 'column-flex';
  const fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;
  return <div className={fullClassName}>{children}</div>;
}
