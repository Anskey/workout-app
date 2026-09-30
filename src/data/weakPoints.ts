import type { MuscleGroup } from '@/types';

export interface WeakPointOptions {
  muscle: MuscleGroup;
  label: string;
  optionSetA: string[];
  optionSetB: string[];
  note?: string;
}

/**
 * The program's own "Weak Points Table" — extracted from the PDF. Each entry
 * lists two independent sets of substitution options for a lagging body
 * part, meant to be slotted into the Arms & Weak Points day's optional slots.
 */
export const WEAK_POINTS: WeakPointOptions[] = [
  {
    muscle: 'Shoulders',
    label: 'Shoulders',
    optionSetA: ['Meadows Incline DB Lateral Raise', 'Machine Lateral Raise', 'Machine Shoulder Press'],
    optionSetB: ['Reverse Pec Deck', 'Cable Unilateral Face Pull', 'Cable Reverse Flye'],
  },
  {
    muscle: 'Back Width',
    label: 'Lats ("Back Width")',
    optionSetA: ['Moto Row', 'DB Pullover', 'Machine Pullover'],
    optionSetB: ['Pull-Up', 'Machine Pulldown', 'Helms Row'],
  },
  {
    muscle: 'Quads',
    label: 'Quads',
    optionSetA: ['Sissy Squat', 'Reverse Nordic', 'Leg Extension'],
    optionSetB: ['Single-Leg Leg Press', 'DB Bulgarian Split Squat', 'Walking Lunge'],
  },
  {
    muscle: 'Glutes',
    label: 'Glutes',
    optionSetA: ['Machine Hip Abduction', 'Cable Hip Abduction', 'Cable Pull-Through'],
    optionSetB: ['DB Bulgarian Split Squat', 'Single-Leg DB Hip Thrust', 'Machine Hip Thrust'],
  },
  {
    muscle: 'Chest',
    label: 'Chest',
    optionSetA: ['DB Flye', 'Pec Deck', 'Press-Around'],
    optionSetB: [
      'Incline Chest Press Machine',
      'Flat Chest Press Machine',
      'Incline Dumbbell Chest Press',
      'Flat Dumbbell Chest Press',
      'Deficit Pushup',
    ],
  },
  {
    muscle: 'Neck',
    label: 'Neck',
    optionSetA: ['Head Harness Neck Curl', 'Plate-Loaded Neck Curl'],
    optionSetB: ['Head Harness Neck Extension', 'Plate-Loaded Neck Extension'],
  },
  {
    muscle: 'Hamstrings',
    label: 'Hamstrings',
    optionSetA: ['Seated Leg Curl', 'Nordic Curl', 'Standing Cable Leg Curl'],
    optionSetB: ['Lying Leg Curl', 'Swiss Ball Leg Curl', 'Sliding Leg Curl'],
  },
  {
    muscle: 'Calves',
    label: 'Calves',
    optionSetA: ['Leg Press Calf Press', 'Seated Calf Raise'],
    optionSetB: ['Single-Leg DB Calf Raise', 'Standing Calf Raise', 'Calf Raise Machine'],
  },
  {
    muscle: 'Back Thickness',
    label: 'Mid-Back ("Back Thickness")',
    optionSetA: ['Kroc Row', 'T-Bar Row', 'Pendlay Row'],
    optionSetB: ['DB Row', 'Smith Machine Row', 'Meadows Row'],
  },
  {
    muscle: 'Traps',
    label: 'Upper Traps',
    optionSetA: ['Seated Dumbbell Shrug', 'Machine Shrug', 'Cable Shrug-In'],
    optionSetB: ['Barbell Shrug', 'Trap Bar Shrug', 'Smith Machine Shrug'],
  },
  {
    muscle: 'Abs',
    label: 'Abs',
    optionSetA: ['Modified Candlestick', 'Lying Leg Raise', 'Hanging Leg Raise'],
    optionSetB: ['Machine Crunch', 'Cable Crunch', 'Swiss Ball Crunch'],
  },
  {
    muscle: 'Forearms',
    label: 'Forearms',
    optionSetA: ['DB Wrist Flexion Curl', 'Reverse Grip EZ-Bar Curl', 'Wrist Roller'],
    optionSetB: ['DB Wrist Extension Curl', 'Hand Gripper', 'Plate Pinch'],
  },
  {
    muscle: 'Biceps',
    label: 'Biceps',
    optionSetA: [],
    optionSetB: [],
    note: 'This program already gives biceps plenty of indirect work from back exercises, plus dedicated arm-day sets — extra volume here tends to be junk volume rather than a real fix.',
  },
  {
    muscle: 'Triceps',
    label: 'Triceps',
    optionSetA: [],
    optionSetB: [],
    note: 'This program already gives triceps plenty of indirect work from pressing, plus dedicated arm-day sets — extra volume here tends to be junk volume rather than a real fix.',
  },
];

export function findWeakPoint(muscle: MuscleGroup): WeakPointOptions | undefined {
  return WEAK_POINTS.find((w) => w.muscle === muscle);
}
