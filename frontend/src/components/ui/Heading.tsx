/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface HeadingProps {
  children: ComponentChildren;
  level?: 1 | 2 | 3;
  noMargin?: boolean;
}

export function Heading({ children, level = 1, noMargin }: HeadingProps) {
  const Tag = `h${level}` as any;
  const className = `heading-level-${level} ${noMargin ? 'heading-no-margin' : ''}`;
  
  return <Tag className={className}>{children}</Tag>;
}
