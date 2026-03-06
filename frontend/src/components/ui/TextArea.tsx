/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

interface TextAreaProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ value, onValueChange, placeholder, rows = 4 }: TextAreaProps) {
  return (
    <textarea
      className="textarea-base"
      value={value}
      onInput={(e) => onValueChange((e.target as HTMLTextAreaElement).value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}
