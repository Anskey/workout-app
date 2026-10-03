import type { MuscleGroup, WorkoutProgram, WorkoutSessionLog } from '@/types';
import { createSeedProgram } from './seedProgram';
import { WEAK_POINTS } from './weakPoints';
import { canonicalExerciseName } from './exerciseAliases';

export interface LibraryExercise {
  name: string;
  muscleGroups: MuscleGroup[];
}

/** Exercises that aren't part of any built-in program but that the user trains, so they're
 * always in the library (and available in the swap picker) without needing a program slot. */
const EXTRA_EXERCISES: LibraryExercise[] = [
  { name: 'Bottom-Half Incline Machine Chest Press', muscleGroups: ['Chest'] },
  { name: 'Bottom-Half Seated Leg Press', muscleGroups: ['Quads'] },
  { name: 'Bottom-Half Leg Press Calf Press', muscleGroups: ['Calves'] },
];

/** A searchable catalog of every exercise name known to the app: everything currently
 * used across all of the user's programs, everything in the built-in program (so swapped-out
 * exercises stay findable), every option in the Weak Points table, and anything the user has
 * ever logged — so a logged exercise can never go missing from the library. Different names for
 * the same exercise (see exerciseAliases) are merged into one entry. */
export function buildExerciseLibrary(programs: WorkoutProgram[], sessionLogs: WorkoutSessionLog[] = []): LibraryExercise[] {
  const byName = new Map<string, Set<MuscleGroup>>();
  const displayNames = new Map<string, string>();

  const add = (rawName: string, muscles: MuscleGroup[]) => {
    const name = canonicalExerciseName(rawName);
    const key = name.toLowerCase();
    if (!key) return;
    if (!byName.has(key)) byName.set(key, new Set());
    muscles.forEach((m) => byName.get(key)!.add(m));
    if (!displayNames.has(key)) displayNames.set(key, name);
  };

  [...programs, createSeedProgram()].forEach((program) => {
    program.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (exercise.isWeakPointSlot) return;
        const muscles = exercise.muscleGroups.filter((m) => m !== 'Weak Point');
        add(exercise.name, muscles);
        (exercise.substitutions ?? []).forEach((sub) => add(sub, muscles));
      });
    });
  });

  WEAK_POINTS.forEach((wp) => {
    [...wp.optionSetA, ...wp.optionSetB].forEach((name) => add(name, [wp.muscle]));
  });

  EXTRA_EXERCISES.forEach((e) => add(e.name, e.muscleGroups));

  // Anything logged, using the muscle groups of the program slot it was logged against.
  sessionLogs.forEach((log) => {
    const day = programs.find((p) => p.id === log.programId)?.days.find((d) => d.id === log.dayId);
    log.exerciseLogs.forEach((e) => {
      const slot = day?.exercises.find((x) => x.id === e.exerciseId);
      add(e.exerciseName, slot ? slot.muscleGroups.filter((m) => m !== 'Weak Point') : []);
    });
  });

  return Array.from(byName.entries())
    .map(([key, muscles]) => ({ name: displayNames.get(key) ?? key, muscleGroups: Array.from(muscles) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
