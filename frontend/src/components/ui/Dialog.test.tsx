/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Dialog } from './Dialog';
import type { ComponentChildren } from 'preact';

// Mock Radix Dialog as it causes environment issues in Vitest/Preact
vi.mock('@radix-ui/react-dialog', () => {
  return {
    Root: ({
      children,
      open,
      onOpenChange,
    }: {
      children: ComponentChildren;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => {
      return (
        <div data-testid="radix-root" data-open={open} onClick={() => onOpenChange?.(!open)}>
          {children}
        </div>
      );
    },
    Trigger: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="radix-trigger">{children}</div>
    ),
    Portal: ({ children }: { children: ComponentChildren }) => (
      <div data-testid="radix-portal">{children}</div>
    ),
    Overlay: ({ className }: { className?: string }) => (
      <div data-testid="radix-overlay" className={className} />
    ),
    Content: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <div data-testid="radix-content" className={className}>
        {children}
      </div>
    ),
    Title: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <h2 data-testid="radix-title" className={className}>
        {children}
      </h2>
    ),
    Close: ({ children, className }: { children: ComponentChildren; className?: string }) => (
      <button data-testid="radix-close" className={className}>
        {children}
      </button>
    ),
  };
});

describe('Dialog', () => {
  it('renders trigger and content', () => {
    render(
      <Dialog trigger={<button>Open</button>} open={true} title="Test Title">
        <div>Dialog Content</div>
      </Dialog>,
    );

    expect(screen.getByTestId('radix-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByTestId('radix-content')).toBeInTheDocument();
    expect(screen.getByTestId('radix-title')).toHaveTextContent('Test Title');
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('renders close button with icon', () => {
    render(
      <Dialog open={true}>
        <div>Content</div>
      </Dialog>,
    );

    const closeBtn = screen.getByTestId('radix-close');
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument(); // sr-only text
  });

  it('passes title and children correctly', () => {
    render(
      <Dialog open={true} title="My Dialog">
        <p>This is my content</p>
      </Dialog>,
    );

    expect(screen.getByTestId('radix-title')).toHaveTextContent('My Dialog');
    expect(screen.getByText('This is my content')).toBeInTheDocument();
  });

  it('handles missing title', () => {
    render(
      <Dialog open={true}>
        <div>Content</div>
      </Dialog>,
    );

    expect(screen.queryByTestId('radix-title')).not.toBeInTheDocument();
  });
});
