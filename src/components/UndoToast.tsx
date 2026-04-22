'use client';

import { useEffect, useState, useCallback } from 'react';
import { Undo2, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function UndoToast({ message, onUndo, onDismiss, duration = 5000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleUndo = useCallback(() => {
    onUndo();
  }, [onUndo]);

  return (
    <div className="fixed bottom-24 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary card-depth border border-border">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-medium text-text-primary">{message}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-text-on-accent active:scale-95"
            >
              <Undo2 size={14} />
              Undo
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-bg-tertiary">
          <div
            className="h-full bg-accent transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
