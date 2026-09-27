import type { MuscleGroup, WorkoutProgram } from '@/types';
import { createSeedProgram } from './seedProgram';
import { WEAK_POINTS } from './weakPoints';

export interface LibraryExercise {
  name: string;
  muscleGroups: MuscleGroup[];
}

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
        rememberDisplay(exercise.name);
        add(exercise.name, exercise.muscleGroups.filter((m) => m !== 'Weak Point'));
      });
    });
  });

  WEAK_POINTS.forEach((wp) => {
    [...wp.optionSetA, ...wp.optionSetB].forEach((name) => {
      rememberDisplay(name);
      add(name, [wp.muscle]);
    });
  });

  return Array.from(byName.entries())
    .map(([key, muscles]) => ({ name: displayNames.get(key) ?? key, muscleGroups: Array.from(muscles) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
