import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import type { Movement, Workout, WorkoutEntry, Template, UserSettings } from '@/types';

// ============================================
// HELPERS
// ============================================

function userCol(userId: string, col: string) {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, 'users', userId, col);
}

function userDoc(userId: string, col: string, docId: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, 'users', userId, col, docId);
}


// ============================================
// MOVEMENTS
// ============================================

export async function getMovements(userId: string): Promise<Movement[]> {
  const snap = await getDocs(query(userCol(userId, 'movements'), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Movement));
}

export async function addMovement(userId: string, movement: Omit<Movement, 'id'>): Promise<string> {
  const ref = await addDoc(userCol(userId, 'movements'), movement);
  return ref.id;
}

export async function updateMovement(userId: string, id: string, data: Partial<Movement>): Promise<void> {
  await updateDoc(userDoc(userId, 'movements', id), data);
}

export async function deleteMovement(userId: string, id: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'movements', id));
}

// ============================================
// WORKOUTS
// ============================================

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const snap = await getDocs(query(userCol(userId, 'workouts'), orderBy('createdAt', 'desc')));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Workout))
    .filter((w) => w.entries && w.entries.length > 0);
}

export async function getTodayWorkout(userId: string): Promise<Workout | null> {
  const today = new Date().toISOString().split('T')[0];
  const snap = await getDocs(userCol(userId, 'workouts'));
  const found = snap.docs.find((d) => d.data().date === today);
  if (!found) return null;
  return { id: found.id, ...found.data() } as Workout;
}

export async function createWorkout(userId: string, date: string): Promise<string> {
  const ref = await addDoc(userCol(userId, 'workouts'), {
    date,
    entries: [],
    createdAt: Date.now(),
    completed: false,
  });
  return ref.id;
}

export async function addEntriesToWorkout(
  userId: string,
  workoutId: string,
  newEntries: WorkoutEntry[]
): Promise<void> {
  const ref = userDoc(userId, 'workouts', workoutId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const existing = (snap.data().entries || []) as WorkoutEntry[];
  await updateDoc(ref, { entries: [...existing, ...newEntries] });
}

export async function addEntryToWorkout(
  userId: string,
  workoutId: string,
  entry: WorkoutEntry
): Promise<void> {
  await addEntriesToWorkout(userId, workoutId, [entry]);
}

export async function updateEntry(
  userId: string,
  workoutId: string,
  entryId: string,
  data: Partial<WorkoutEntry>
): Promise<void> {
  const ref = userDoc(userId, 'workouts', workoutId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const entries = (snap.data().entries || []) as WorkoutEntry[];
  const updated = entries.map((e) => (e.id === entryId ? { ...e, ...data } : e));
  await updateDoc(ref, { entries: updated });
}

export async function deleteEntry(
  userId: string,
  workoutId: string,
  entryId: string
): Promise<void> {
  const ref = userDoc(userId, 'workouts', workoutId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const entries = (snap.data().entries || []) as WorkoutEntry[];
  const filtered = entries.filter((e) => e.id !== entryId);
  if (filtered.length === 0) {
    await deleteDoc(ref);
  } else {
    await updateDoc(ref, { entries: filtered });
  }
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'workouts', workoutId));
}

export async function completeWorkout(userId: string, workoutId: string): Promise<void> {
  await updateDoc(userDoc(userId, 'workouts', workoutId), { completed: true });
}

// ============================================
// TEMPLATES
// ============================================

export async function getTemplates(userId: string): Promise<Template[]> {
  const snap = await getDocs(query(userCol(userId, 'templates'), orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template));
}

export async function createTemplate(userId: string, template: Omit<Template, 'id'>): Promise<string> {
  const ref = await addDoc(userCol(userId, 'templates'), template);
  return ref.id;
}

export async function updateTemplate(userId: string, id: string, data: Partial<Template>): Promise<void> {
  await updateDoc(userDoc(userId, 'templates', id), data);
}

export async function deleteTemplate(userId: string, id: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'templates', id));
}

export async function reorderTemplates(userId: string, templates: Template[]): Promise<void> {
  const promises = templates.map((t, i) =>
    updateDoc(userDoc(userId, 'templates', t.id), { order: i })
  );
  await Promise.all(promises);
}

// ============================================
// SETTINGS
// ============================================

export async function getUserSettings(userId: string): Promise<UserSettings> {
  if (!db) return { unit: 'kg', theme: 'system' };
  const ref = doc(db, 'users', userId, 'settings', 'current');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { unit: 'kg', theme: 'system' };
  }
  return snap.data() as UserSettings;
}

export async function updateUserSettings(userId: string, data: Partial<UserSettings>): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', userId, 'settings', 'current');
  await setDoc(ref, data, { merge: true });
}

