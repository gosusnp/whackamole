/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

interface InputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
}

export function Input({ value, onValueChange, placeholder, type = 'text' }: InputProps) {
  return (
    <input
      type={type}
      className="input-base"
      value={value}
      onInput={(e) => onValueChange((e.target as HTMLInputElement).value)}
      placeholder={placeholder}
    />
  );
}
