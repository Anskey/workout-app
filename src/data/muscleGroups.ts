import type { MuscleGroup } from '@/types';

type Category = 'push' | 'pull' | 'legs' | 'core';

const CATEGORY: Record<MuscleGroup, Category> = {
  Chest: 'push',
  Shoulders: 'push',
  'Rear Delts': 'push',
  Triceps: 'push',
  'Back Width': 'pull',
  'Back Thickness': 'pull',
  Biceps: 'pull',
  Traps: 'pull',
  Forearms: 'pull',
  Quads: 'legs',
  Hamstrings: 'legs',
  Glutes: 'legs',
  Calves: 'legs',
  Adductors: 'legs',
  Abs: 'core',
  Neck: 'core',
  'Weak Point': 'core',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  push: '#D9A441',
  pull: '#3FA39A',
  legs: '#7FA9CC',
  core: '#9CC1DE',
};

export function getMuscleColor(muscle: MuscleGroup): string {
  return CATEGORY_COLORS[CATEGORY[muscle]];
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back Width', 'Back Thickness', 'Shoulders', 'Rear Delts', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abs', 'Neck', 'Traps',
];
