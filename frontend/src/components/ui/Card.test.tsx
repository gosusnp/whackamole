/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a string title', () => {
    render(<Card title="My Card">Content</Card>);
    expect(screen.getByText('My Card')).toBeInTheDocument();
  });

  it('renders a JSX title', () => {
    render(<Card title={<span>JSX Title</span>}>Content</Card>);
    expect(screen.getByText('JSX Title')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Card footer={<span>Footer content</span>}>Content</Card>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('does not render header when title is not provided', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('.card-header')).toBeNull();
  });

  it('does not render footer when footer is not provided', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('.card-footer')).toBeNull();
  });
});
