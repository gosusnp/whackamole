/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Text } from './Text';

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello world</Text>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a paragraph', () => {
    render(<Text>Content</Text>);
    expect(screen.getByText('Content').tagName).toBe('P');
  });

  it('applies muted class when muted is set', () => {
    render(<Text muted>Muted text</Text>);
    expect(screen.getByText('Muted text')).toHaveClass('text-muted');
  });

  it('applies small class when small is set', () => {
    render(<Text small>Small text</Text>);
    expect(screen.getByText('Small text')).toHaveClass('text-small');
  });

  it('applies both muted and small classes together', () => {
    render(
      <Text muted small>
        Both
      </Text>,
    );
    const el = screen.getByText('Both');
    expect(el).toHaveClass('text-muted');
    expect(el).toHaveClass('text-small');
  });
});
