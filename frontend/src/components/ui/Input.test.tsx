/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { Input } from './Input';

describe('Input', () => {
  it('renders with value', () => {
    render(<Input value="hello" onValueChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onValueChange on input', () => {
    const onValueChange = vi.fn();
    render(<Input value="" onValueChange={onValueChange} />);
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'new value' } });
    expect(onValueChange).toHaveBeenCalledWith('new value');
  });

  it('renders placeholder', () => {
    render(<Input value="" onValueChange={vi.fn()} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies input-base class', () => {
    render(<Input value="" onValueChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveClass('input-base');
  });
});
