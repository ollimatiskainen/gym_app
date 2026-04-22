import { Category } from '@/types';

export interface DefaultMovement {
  name: string;
  category: Category;
}

export const DEFAULT_MOVEMENTS: DefaultMovement[] = [
  // Legs
  { name: 'Squat', category: 'Legs' },
  { name: 'Front Squat', category: 'Legs' },
  { name: 'Hack Squat', category: 'Legs' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Romanian Deadlift', category: 'Legs' },
  { name: 'Walking Lunge', category: 'Legs' },
  { name: 'Bulgarian Split Squat', category: 'Legs' },
  { name: 'Leg Extension', category: 'Legs' },
  { name: 'Leg Curl', category: 'Legs' },
  { name: 'Hip Thrust', category: 'Legs' },
  { name: 'Calf Raise', category: 'Legs' },
  { name: 'Goblet Squat', category: 'Legs' },

  // Back
  { name: 'Deadlift', category: 'Back' },
  { name: 'Barbell Row', category: 'Back' },
  { name: 'Dumbbell Row', category: 'Back' },
  { name: 'Seated Cable Row', category: 'Back' },
  { name: 'T-Bar Row', category: 'Back' },
  { name: 'Pull-Up', category: 'Back' },
  { name: 'Chin-Up', category: 'Back' },
  { name: 'Lat Pulldown', category: 'Back' },
  { name: 'Face Pull', category: 'Back' },
  { name: 'Shrug', category: 'Back' },

  // Chest
  { name: 'Bench Press', category: 'Chest' },
  { name: 'Incline Bench Press', category: 'Chest' },
  { name: 'Dumbbell Bench Press', category: 'Chest' },
  { name: 'Incline Dumbbell Press', category: 'Chest' },
  { name: 'Cable Fly', category: 'Chest' },
  { name: 'Dumbbell Fly', category: 'Chest' },
  { name: 'Chest Dip', category: 'Chest' },
  { name: 'Push-Up', category: 'Chest' },
  { name: 'Machine Chest Press', category: 'Chest' },

  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders' },
  { name: 'Arnold Press', category: 'Shoulders' },
  { name: 'Lateral Raise', category: 'Shoulders' },
  { name: 'Front Raise', category: 'Shoulders' },
  { name: 'Reverse Fly', category: 'Shoulders' },
  { name: 'Upright Row', category: 'Shoulders' },

  // Arms
  { name: 'Barbell Curl', category: 'Arms' },
  { name: 'Dumbbell Curl', category: 'Arms' },
  { name: 'Hammer Curl', category: 'Arms' },
  { name: 'Preacher Curl', category: 'Arms' },
  { name: 'Cable Curl', category: 'Arms' },
  { name: 'Tricep Pushdown', category: 'Arms' },
  { name: 'Overhead Tricep Extension', category: 'Arms' },
  { name: 'Skull Crusher', category: 'Arms' },
  { name: 'Close-Grip Bench Press', category: 'Arms' },
  { name: 'Tricep Dip', category: 'Arms' },

  // Core
  { name: 'Plank', category: 'Core' },
  { name: 'Hanging Leg Raise', category: 'Core' },
  { name: 'Cable Crunch', category: 'Core' },
  { name: 'Ab Wheel Rollout', category: 'Core' },
  { name: 'Dead Bug', category: 'Core' },
  { name: 'Russian Twist', category: 'Core' },
  { name: 'Decline Sit-Up', category: 'Core' },

  // Cardio
  { name: 'Running', category: 'Cardio' },
  { name: 'Rowing Machine', category: 'Cardio' },
  { name: 'Stationary Bike', category: 'Cardio' },
  { name: 'Jump Rope', category: 'Cardio' },
  { name: 'Stair Climber', category: 'Cardio' },
];

export const CATEGORIES: Category[] = [
  'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other',
];
