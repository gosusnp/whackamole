/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface HeadingProps {
  children: ComponentChildren;
  level?: 1 | 2 | 3;
}

export function Heading({ children, level = 1 }: HeadingProps) {
  const Tag = `h${level}` as any;
  return <Tag className={`heading-level-${level}`}>{children}</Tag>;
}
