/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import type { ComponentChildren } from 'preact';

interface CardProps {
  children: ComponentChildren;
  title?: ComponentChildren;
  footer?: ComponentChildren;
}

export function Card({ children, title, footer }: CardProps) {
  return (
    <div className="card-base">
      {title && (
        <div className="card-header">
          {typeof title === 'string' ? <h3 className="card-title">{title}</h3> : title}
        </div>
      )}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
