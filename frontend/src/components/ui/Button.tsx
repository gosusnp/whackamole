/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface ButtonProps {
  children: ComponentChildren;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
  className: extraClassName,
}: ButtonProps) {
  const baseClassName = `btn-base btn-${variant}`;
  const fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;

  return (
    <button
      type={type}
      className={fullClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
