/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface RowProps {
  children: ComponentChildren;
  justify?: 'start' | 'center' | 'end' | 'between';
  items?: 'start' | 'center' | 'end' | 'baseline';
  gap?: 2 | 4 | 6 | 8;
  fullWidth?: boolean;
  className?: string;
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;
const itemsMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
} as const;
const gapMap = { 2: 'gap-2', 4: 'gap-4', 6: 'gap-6', 8: 'gap-8' } as const;

export function Row({
  children,
  justify = 'start',
  items = 'center',
  gap = 4,
  fullWidth = true,
  className: extraClassName,
}: RowProps) {
  const baseClassName = `layout-row ${justifyMap[justify]} ${itemsMap[items]} ${gapMap[gap]}`;
  let fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;
  if (fullWidth) fullClassName += ' w-full';

  return <div className={fullClassName}>{children}</div>;
}
