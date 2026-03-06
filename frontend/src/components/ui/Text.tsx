import type { ComponentChildren } from 'preact';

interface TextProps {
  children: ComponentChildren;
  muted?: boolean;
  small?: boolean;
}

export function Text({ children, muted, small }: TextProps) {
  let className = 'text-base';
  if (muted) className += ' text-muted';
  if (small) className += ' text-small';
  
  return <p className={className}>{children}</p>;
}
