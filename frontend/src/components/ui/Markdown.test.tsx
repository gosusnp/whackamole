/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Markdown } from './Markdown';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({ default: () => {} }));

describe('Markdown', () => {
  it('wraps content in prose-content class', () => {
    const { container } = render(<Markdown content="Hello world" />);
    expect(container.firstChild).toHaveClass('prose-content');
  });

  it('renders the content', () => {
    render(<Markdown content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
