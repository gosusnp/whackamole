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
}

export function Row({ children, justify = 'start', items = 'center', gap = 4 }: RowProps) {
  const className = `layout-row justify-${justify} items-${items} gap-${gap}`;
  
  return <div className={className}>{children}</div>;
}
