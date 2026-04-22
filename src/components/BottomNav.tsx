'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, ClipboardList, Dumbbell, BarChart2, Settings } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Workout', icon: Activity },
  { href: '/templates', label: 'Templates', icon: ClipboardList },
  { href: '/movements', label: 'Movements', icon: Dumbbell },
  { href: '/history', label: 'History', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg">
        <div
          className="flex items-center justify-around border-t backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--color-glass-bg)',
            borderColor: 'var(--color-glass-border)',
          }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2.5 active:scale-90 ${
                  isActive
                    ? 'text-accent scale-105 drop-shadow-md'
                    : 'text-text-tertiary hover:text-accent/70'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
        {/* iOS home indicator spacer */}
        <div
          className="w-full"
          style={{
            height: 'env(safe-area-inset-bottom)',
            backgroundColor: 'var(--color-glass-bg)',
          }}
        />
      </div>
    </nav>
  );
}
