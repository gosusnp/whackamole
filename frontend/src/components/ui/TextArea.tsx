/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

interface TextAreaProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextArea({
  value,
  onValueChange,
  placeholder,
  rows = 4,
  className = '',
}: TextAreaProps) {
  const baseClassName = 'textarea-base';
  const fullClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <textarea
      className={fullClassName}
      value={value}
      onInput={(e) => onValueChange((e.target as HTMLTextAreaElement).value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
