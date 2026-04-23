'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMovements, addMovement, updateMovement, deleteMovement } from '@/lib/firestore';
import { CATEGORIES } from '@/lib/constants';
import { SkeletonList } from '@/components/Skeleton';
import { Plus, Pencil, Trash2, Check, X, Search } from 'lucide-react';
import type { Movement, Category } from '@/types';

export default function MovementsPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Legs');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Legs');

  useEffect(() => {
    if (!user) return;
    getMovements(user.uid)
      .then(setMovements)
      .catch((err) => console.error('Failed to load movements:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = movements.filter((m) => {
    if (filter !== 'All' && m.category !== filter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || !user) return;
    const id = await addMovement(user.uid, { name: newName.trim(), category: newCategory, isCustom: true });
    setMovements((prev) => [...prev, { id, name: newName.trim(), category: newCategory, isCustom: true }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName('');
  }, [newName, newCategory, user]);

  const handleDelete = useCallback(async (id: string) => {
    setMovements((prev) => prev.filter((m) => m.id !== id));
    await deleteMovement(user!.uid, id);
  }, [user]);

  const startEdit = (m: Movement) => { setEditingId(m.id); setEditName(m.name); setEditCategory(m.category); };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = useCallback(async () => {
    if (!editingId || !editName.trim()) return;
    await updateMovement(user!.uid, editingId, { name: editName.trim(), category: editCategory });
    setMovements((prev) => prev.map((m) => m.id === editingId ? { ...m, name: editName.trim(), category: editCategory } : m));
    setEditingId(null);
  }, [editingId, editName, editCategory, user]);

  if (loading) return <div className="py-4"><SkeletonList count={4} /></div>;

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Movements</h1>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movements..." className="w-full rounded-sm border border-border bg-bg-secondary pl-10 pr-4 py-3 text-sm focus:border-accent focus:outline-none" />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('All')} className={`rounded-sm px-3 py-1.5 text-xs font-bold active:scale-95 ${filter === 'All' ? 'bg-accent text-text-on-accent' : 'bg-bg-tertiary text-text-secondary'}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-sm px-3 py-1.5 text-xs font-bold active:scale-95 ${filter === c ? 'bg-accent text-text-on-accent' : 'bg-bg-tertiary text-text-secondary'}`}>{c}</button>
        ))}
      </div>

      {/* Add Form */}
      <div className="rounded-sm bg-bg-secondary p-4 card-depth">
        <h3 className="mb-2 text-sm font-bold text-text-primary">Add Movement</h3>
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} placeholder="Movement name" className="flex-1 rounded-sm border border-border bg-bg-primary px-3 py-2.5 text-sm focus:border-accent focus:outline-none" />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Category)} className="rounded-sm border border-border bg-bg-primary px-2 py-2.5 text-sm focus:outline-none">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleAdd} disabled={!newName.trim()} className="rounded-sm bg-accent px-3 py-2.5 text-text-on-accent active:scale-95 disabled:opacity-50"><Plus size={18} /></button>
        </div>
      </div>

      {/* Movement List */}
      <div className="flex flex-col gap-1.5">
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-sm bg-bg-secondary px-4 py-3">
            {editingId === m.id ? (
              <div className="flex flex-1 items-center gap-2">
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 rounded-sm border border-accent bg-bg-primary px-2 py-1 text-sm focus:outline-none" autoFocus />
                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Category)} className="rounded-sm border border-border bg-bg-primary px-1 py-1 text-xs">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={saveEdit} className="text-success active:scale-90"><Check size={16} /></button>
                <button onClick={cancelEdit} className="text-text-tertiary active:scale-90"><X size={16} /></button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-sm font-medium text-text-primary">{m.name}</span>
                  <span className="ml-2 text-xs text-text-tertiary">{m.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(m)} className="p-1.5 text-text-tertiary hover:text-accent active:scale-90"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-text-tertiary hover:text-danger active:scale-90"><Trash2 size={14} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
