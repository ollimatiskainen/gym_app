'use client';

import { ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
}

export default function StaggeredList({ children, className = '' }: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className="animate-stagger-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
