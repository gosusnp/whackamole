/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

interface InputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  autoFocus?: boolean;
  className?: string;
}

export function Input({
  value,
  onValueChange,
  placeholder,
  type = 'text',
  autoFocus,
  className: extraClassName,
}: InputProps) {
  const baseClassName = 'input-base';
  const fullClassName = extraClassName ? `${baseClassName} ${extraClassName}` : baseClassName;

  return (
    <input
      type={type}
      className={fullClassName}
      value={value}
      onInput={(e) => onValueChange((e.target as HTMLInputElement).value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  );
}
