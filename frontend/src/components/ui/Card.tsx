import type { ComponentChildren } from 'preact';

interface CardProps {
  children: ComponentChildren;
  title?: string;
  footer?: ComponentChildren;
}

export function Card({ children, title, footer }: CardProps) {
  return (
    <div className="card-base">
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-content">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
