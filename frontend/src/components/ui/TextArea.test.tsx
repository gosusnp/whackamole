/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('renders with value', () => {
    render(<TextArea value="hello" onValueChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onValueChange on input', () => {
    const onValueChange = vi.fn();
    render(<TextArea value="" onValueChange={onValueChange} />);
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'new text' } });
    expect(onValueChange).toHaveBeenCalledWith('new text');
  });

  it('renders placeholder', () => {
    render(<TextArea value="" onValueChange={vi.fn()} placeholder="Add description..." />);
    expect(screen.getByPlaceholderText('Add description...')).toBeInTheDocument();
  });

  it('uses default rows of 4', () => {
    render(<TextArea value="" onValueChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });

  it('uses custom rows', () => {
    render(<TextArea value="" onValueChange={vi.fn()} rows={8} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
  });
});
