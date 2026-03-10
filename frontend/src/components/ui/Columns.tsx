/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface ColumnsProps {
  children: ComponentChildren;
  vertical?: boolean;
  gap?: 2 | 4 | 6 | 8;
  fullWidth?: boolean;
  className?: string;
}

const gapMap = { 2: 'gap-2', 4: 'gap-4', 6: 'gap-6', 8: 'gap-8' } as const;

export function Columns({
  children,
  vertical = false,
  gap = 6,
  fullWidth = true,
  className: extraClassName,
}: ColumnsProps) {
  const baseClassName = vertical ? 'layout-columns layout-columns-vertical' : 'layout-columns';
  let fullClassName = `${baseClassName} ${gapMap[gap]} ${extraClassName || ''}`;
  if (fullWidth) fullClassName += ' w-full';

  return <div className={fullClassName.trim()}>{children}</div>;
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
