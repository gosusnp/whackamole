/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface TextProps {
  children: ComponentChildren;
  muted?: boolean;
  small?: boolean;
  className?: string;
}

export function Text({ children, muted, small, className: extraClassName }: TextProps) {
  let baseClass = 'text-base';
  if (muted) baseClass += ' text-muted';
  if (small) baseClass += ' text-small';

  const fullClassName = extraClassName ? `${baseClass} ${extraClassName}` : baseClass;

  return <p className={fullClassName}>{children}</p>;
}
