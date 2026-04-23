'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { seedDefaultMovements, seedDefaultTemplates } from '@/lib/seedData';
import { Database, CheckCircle, Loader2 } from 'lucide-react';

export default function SeedPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSeedMovements = async () => {
    if (!user) return;
    setLoading(true);
    setStatus('Seeding movements...');
    try {
      await seedDefaultMovements(user.uid);
      setStatus('Movements seeded successfully!');
    } catch (err) {
      setStatus('Error: ' + (err as Error).message);
    }
    setLoading(false);
  };

  const handleSeedTemplates = async () => {
    if (!user) return;
    setLoading(true);
    setStatus('Seeding templates...');
    try {
      await seedDefaultTemplates(user.uid);
      setStatus('Templates seeded successfully!');
    } catch (err) {
      setStatus('Error: ' + (err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Seed Data (Dev)</h1>
      <p className="text-sm text-text-secondary">Use these buttons to seed default data. Both operations are idempotent.</p>

      <button onClick={handleSeedMovements} disabled={loading} className="flex items-center justify-center gap-2 rounded-sm bg-accent py-3 font-bold text-text-on-accent active:scale-95 disabled:opacity-50">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
        Seed Default Movements
      </button>

      <button onClick={handleSeedTemplates} disabled={loading} className="flex items-center justify-center gap-2 rounded-sm bg-accent py-3 font-bold text-text-on-accent active:scale-95 disabled:opacity-50">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
        Seed Default Templates
      </button>

      {status && (
        <div className="rounded-sm bg-bg-secondary p-4 text-sm text-text-secondary card-depth">
          {status}
        </div>
      )}
    </div>
  );
}
