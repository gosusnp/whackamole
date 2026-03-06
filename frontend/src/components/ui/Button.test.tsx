/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies primary class by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('applies ghost class for ghost variant', () => {
    render(<Button variant="ghost">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-ghost');
  });

  it('applies secondary class for secondary variant', () => {
    render(<Button variant="secondary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  it('renders with aria-label', () => {
    render(
      <Button aria-label="Save task">
        <span>icon</span>
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
  });
});
