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

const tags = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

export function Heading({ children, level = 1, noMargin }: HeadingProps) {
  const Tag = tags[level];
  const className = `heading-level-${level} ${noMargin ? 'heading-no-margin' : ''}`;

  return <Tag className={className}>{children}</Tag>;
}
