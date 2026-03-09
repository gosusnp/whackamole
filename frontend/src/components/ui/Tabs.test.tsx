/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Tabs } from './Tabs';
import type { ComponentChildren } from 'preact';

// Mock Radix Tabs
vi.mock('@radix-ui/react-tabs', () => {
  return {
    Root: ({ children, value }: { children: ComponentChildren; value?: string }) => (
      <div data-testid="tabs-root" data-value={value}>
        {children}
      </div>
    ),
    List: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="tabs-list">{children}</div>
    ),
    Trigger: ({ children, value }: { children: ComponentChildren; value: string }) => (
      <button data-testid={`trigger-${value}`} role="tab">
        {children}
      </button>
    ),
    Content: ({ children, value }: { children: ComponentChildren; value: string }) => (
      <div data-testid={`content-${value}`}>{children}</div>
    ),
  };
});

describe('Tabs', () => {
  const mockItems = [
    { id: 'tab1', label: 'Tab 1', content: <div data-testid="c1">Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div data-testid="c2">Content 2</div> },
  ];

  it('renders tab triggers', () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByTestId('trigger-tab1')).toBeInTheDocument();
    expect(screen.getByTestId('trigger-tab2')).toBeInTheDocument();
  });

  it('renders headerExtra content', () => {
    render(<Tabs items={mockItems} headerExtra={<button data-testid="extra-btn">Extra</button>} />);
    expect(screen.getByTestId('extra-btn')).toBeInTheDocument();
  });

  it('renders all content areas', () => {
    render(<Tabs items={mockItems} />);
    expect(screen.getByTestId('content-tab1')).toBeInTheDocument();
    expect(screen.getByTestId('content-tab2')).toBeInTheDocument();
  });
});
