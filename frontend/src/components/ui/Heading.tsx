/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface HeadingProps {
  children: ComponentChildren;
  level?: 1 | 2 | 3;
  noMargin?: boolean;
  className?: string;
}

const tags = { 1: 'h1', 2: 'h2', 3: 'h3' } as const;

export function Heading({
  children,
  level = 1,
  noMargin,
  className: extraClassName,
}: HeadingProps) {
  const Tag = tags[level];
  const baseClassName = `heading-level-${level} ${noMargin ? 'heading-no-margin' : ''}`;
  const fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;

  return <Tag className={fullClassName}>{children}</Tag>;
}
