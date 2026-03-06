/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface TextProps {
  children: ComponentChildren;
  muted?: boolean;
  small?: boolean;
  bold?: boolean;
  className?: string;
}

export function Text({ children, muted, small, bold, className: extraClassName }: TextProps) {
  let baseClass = 'text-base';
  if (muted) baseClass += ' text-muted';
  if (small) baseClass += ' text-small';
  if (bold) baseClass += ' font-bold';

  const fullClassName = extraClassName ? `${baseClass} ${extraClassName}` : baseClass;

  return <p className={fullClassName}>{children}</p>;
}
