import { DEFAULT_MOVEMENTS } from './constants';
import { addMovement, getMovements, getTemplates, createTemplate } from './firestore';
import type { TemplateEntry } from '@/types';

export async function seedDefaultMovements(userId: string): Promise<void> {
  const existing = await getMovements(userId);
  if (existing.length > 0) return; // already seeded

  const promises = DEFAULT_MOVEMENTS.map((m) =>
    addMovement(userId, { name: m.name, category: m.category, isCustom: false })
  );
  await Promise.all(promises);
}

export async function seedDefaultTemplates(userId: string): Promise<void> {
  const existing = await getTemplates(userId);
  if (existing.length > 0) return; // already seeded

  const templates: { name: string; entries: TemplateEntry[] }[] = [
    {
      name: 'Full Body A',
      entries: [
        { movementName: 'Squat', reps: 5, weight: 60, unit: 'kg' },
        { movementName: 'Bench Press', reps: 5, weight: 60, unit: 'kg' },
        { movementName: 'Barbell Row', reps: 5, weight: 50, unit: 'kg' },
        { movementName: 'Overhead Press', reps: 8, weight: 30, unit: 'kg' },
        { movementName: 'Barbell Curl', reps: 10, weight: 20, unit: 'kg' },
      ],
    },
    {
      name: 'Full Body B',
      entries: [
        { movementName: 'Deadlift', reps: 5, weight: 80, unit: 'kg' },
        { movementName: 'Incline Bench Press', reps: 8, weight: 50, unit: 'kg' },
        { movementName: 'Pull-Up', reps: 8, weight: 0, unit: 'kg' },
        { movementName: 'Lateral Raise', reps: 12, weight: 8, unit: 'kg' },
        { movementName: 'Tricep Pushdown', reps: 12, weight: 25, unit: 'kg' },
      ],
    },
    {
      name: 'Push Day',
      entries: [
        { movementName: 'Bench Press', reps: 5, weight: 70, unit: 'kg' },
        { movementName: 'Overhead Press', reps: 8, weight: 35, unit: 'kg' },
        { movementName: 'Incline Dumbbell Press', reps: 10, weight: 22, unit: 'kg' },
        { movementName: 'Cable Fly', reps: 12, weight: 15, unit: 'kg' },
        { movementName: 'Lateral Raise', reps: 15, weight: 8, unit: 'kg' },
        { movementName: 'Skull Crusher', reps: 10, weight: 20, unit: 'kg' },
      ],
    },
  ];

  for (let i = 0; i < templates.length; i++) {
    await createTemplate(userId, {
      name: templates[i].name,
      entries: templates[i].entries,
      createdAt: Date.now(),
      order: i,
    });
  }
}
