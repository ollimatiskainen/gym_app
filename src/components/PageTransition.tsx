'use client';

import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState, ReactNode } from 'react';

const tabOrder = ['/', '/templates', '/movements', '/history', '/settings'];

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [direction, setDirection] = useState<'none' | 'left' | 'right'>('none');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const prevIndex = tabOrder.indexOf(prevPathRef.current);
    const currIndex = tabOrder.indexOf(pathname);

    if (prevIndex !== -1 && currIndex !== -1 && prevIndex !== currIndex) {
      setDirection(currIndex > prevIndex ? 'right' : 'left');
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevPathRef.current = pathname;
      return () => clearTimeout(timer);
    }

    prevPathRef.current = pathname;
  }, [pathname]);

  const animClass = isAnimating
    ? direction === 'right'
      ? 'animate-[slide-in-right_0.3s_var(--ease-out)_both]'
      : 'animate-[slide-in-left_0.3s_var(--ease-out)_both]'
    : '';

  return <div className={animClass}>{children}</div>;
}
