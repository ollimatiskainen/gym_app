'use client';

import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { getWorkouts } from '@/lib/firestore';
import { LogOut, Download, Sun, Moon, Monitor } from 'lucide-react';
import { useCallback } from 'react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { theme } = useTheme();

  const handleExportCSV = useCallback(async () => {
    if (!user) return;
    const workouts = await getWorkouts(user.uid);
    const rows = [['Date', 'Movement', 'Weight', 'Unit', 'Reps', 'Notes']];
    for (const w of workouts) {
      for (const e of w.entries) {
        rows.push([w.date, e.movementName, String(e.weight), e.unit, String(e.reps), `"${(e.notes || '').replace(/"/g, '""')}"`]);
      }
    }
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [user]);

  const themeOptions: { value: 'system' | 'light' | 'dark'; label: string; icon: typeof Sun }[] = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const unitOptions: ('kg' | 'lbs')[] = ['kg', 'lbs'];

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

      {/* Profile */}
      <div className="rounded-2xl bg-bg-secondary p-5 card-depth">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">Profile</h2>
        <p className="mb-4 text-sm text-text-secondary">{user?.email}</p>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger/20 active:scale-95">
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-bg-secondary p-5 card-depth">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">Appearance</h2>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = settings.theme === opt.value;
            return (
              <button key={opt.value} onClick={() => updateSettings({ theme: opt.value })} className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-sm font-medium active:scale-95 ${active ? 'bg-accent text-text-on-accent shadow-[var(--shadow-btn)]' : 'bg-bg-primary text-text-secondary border border-border'}`}>
                <Icon size={20} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weight Unit */}
      <div className="rounded-2xl bg-bg-secondary p-5 card-depth">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">Weight Unit</h2>
        <div className="grid grid-cols-2 gap-2">
          {unitOptions.map((u) => (
            <button key={u} onClick={() => updateSettings({ unit: u })} className={`rounded-xl py-3 text-sm font-bold active:scale-95 ${settings.unit === u ? 'bg-accent text-text-on-accent shadow-[var(--shadow-btn)]' : 'bg-bg-primary text-text-secondary border border-border'}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="rounded-2xl bg-bg-secondary p-5 card-depth">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-tertiary">Data</h2>
        <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-xl border border-border bg-bg-primary px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-tertiary active:scale-95">
          <Download size={16} /> Export All Data as CSV
        </button>
      </div>

      {/* Footer */}
      <p className="py-4 text-center text-xs text-text-tertiary">
        Gym Logger &bull; Built with Next.js &amp; Firebase
      </p>
    </div>
  );
}
