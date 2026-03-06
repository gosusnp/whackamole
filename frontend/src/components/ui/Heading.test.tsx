/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders as h1 by default', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders as h2 for level 2', () => {
    render(<Heading level={2}>Subtitle</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders as h3 for level 3', () => {
    render(<Heading level={3}>Section</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies level-specific class', () => {
    render(<Heading level={2}>Heading</Heading>);
    expect(screen.getByRole('heading')).toHaveClass('heading-level-2');
  });

  it('applies noMargin class when noMargin is set', () => {
    render(<Heading noMargin>Title</Heading>);
    expect(screen.getByRole('heading')).toHaveClass('heading-no-margin');
  });

  it('does not apply noMargin class by default', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading')).not.toHaveClass('heading-no-margin');
  });
});
