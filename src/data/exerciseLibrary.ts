import type { MuscleGroup, WorkoutProgram } from '@/types';
import { createSeedProgram } from './seedProgram';
import { WEAK_POINTS } from './weakPoints';

export interface LibraryExercise {
  name: string;
  muscleGroups: MuscleGroup[];
}

/** Exercises that aren't part of any built-in program but that the user trains, so they're
 * always in the library (and available in the swap picker) without needing a program slot. */
const EXTRA_EXERCISES: LibraryExercise[] = [
  { name: 'Machine Chest Press', muscleGroups: ['Chest'] },
  { name: 'Bottom-Half Incline Chest Press Machine', muscleGroups: ['Chest'] },
  { name: 'Bottom-Half Seated Leg Press', muscleGroups: ['Quads'] },
  { name: 'Bottom-Half Leg Press Calf Press', muscleGroups: ['Calves'] },
];

/** A searchable catalog of every exercise name known to the app: everything currently
 * used across all of the user's programs, everything in the built-in program (so swapped-out
 * exercises stay findable), plus every option in the Weak Points table. */
export function buildExerciseLibrary(programs: WorkoutProgram[]): LibraryExercise[] {
  const byName = new Map<string, Set<MuscleGroup>>();

  const add = (name: string, muscles: MuscleGroup[]) => {
    const key = name.trim().toLowerCase();
    if (!key) return;
    if (!byName.has(key)) byName.set(key, new Set());
    const set = byName.get(key)!;
    muscles.forEach((m) => set.add(m));
  };
  const displayNames = new Map<string, string>();
  const rememberDisplay = (name: string) => {
    const key = name.trim().toLowerCase();
    if (!displayNames.has(key)) displayNames.set(key, name.trim());
  };

  [...programs, createSeedProgram()].forEach((program) => {
    program.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (exercise.isWeakPointSlot) return;
        const muscles = exercise.muscleGroups.filter((m) => m !== 'Weak Point');
        rememberDisplay(exercise.name);
        add(exercise.name, muscles);
        (exercise.substitutions ?? []).forEach((sub) => {
          rememberDisplay(sub);
          add(sub, muscles);
        });
      });
    });
  });

  WEAK_POINTS.forEach((wp) => {
    [...wp.optionSetA, ...wp.optionSetB].forEach((name) => {
      rememberDisplay(name);
      add(name, [wp.muscle]);
    });
  });

  EXTRA_EXERCISES.forEach((e) => {
    rememberDisplay(e.name);
    add(e.name, e.muscleGroups);
  });

  return Array.from(byName.entries())
    .map(([key, muscles]) => ({ name: displayNames.get(key) ?? key, muscleGroups: Array.from(muscles) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
