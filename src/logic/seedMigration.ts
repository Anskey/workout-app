import type { WorkoutProgram, WorkoutSessionLog } from '@/types';
import { getDefaultProgram } from '@/data/seedProgram';
import { canonicalExerciseName } from '@/data/exerciseAliases';
import { LEGACY_SLOT_NAMES } from '@/data/legacySlotNames';

/** Logged history keeps the name an exercise had when it was logged; when a built-in slot is
 * renamed, entries logged against that slot under its previous name follow the rename. */
export function renameLegacyLoggedNames(logs: WorkoutSessionLog[]): WorkoutSessionLog[] {
  return logs.map((l) => {
    const day = getDefaultProgram(l.programId)?.days.find((d) => d.id === l.dayId);
    if (!day) return l;
    return {
      ...l,
      exerciseLogs: l.exerciseLogs.map((el) => {
        const current = day.exercises.find((x) => x.id === el.exerciseId);
        return current && LEGACY_SLOT_NAMES[el.exerciseId] === el.exerciseName ? { ...el, exerciseName: current.name } : el;
      }),
    };
  });
}

/** Applies the current seed names to exercises still on an older name for the same exercise
 * (see exerciseAliases). Matches by day + exercise id and only renames when the name is an
 * alias of the seed name, so anything the user renamed or swapped is left alone. */
export function renameLegacySeedExercises(programs: WorkoutProgram[]): WorkoutProgram[] {
  return programs.map((p) => {
    const defaultProgram = getDefaultProgram(p.id);
    if (!defaultProgram) return p;
    return {
      ...p,
      days: p.days.map((d) => {
        const defaultDay = defaultProgram.days.find((dd) => dd.id === d.id);
        if (!defaultDay) return d;
        return {
          ...d,
          exercises: d.exercises.map((e) => {
            const defaultEx = defaultDay.exercises.find((de) => de.id === e.id);
            if (!defaultEx) return e;
            // Untouched means its name is still an older name for what this slot is called in the
            // seed: either an alias, or the slot's previous built-in name.
            const untouched =
              e.name !== defaultEx.name && (canonicalExerciseName(e.name) === defaultEx.name || LEGACY_SLOT_NAMES[e.id] === e.name);
            // The substitution options come from the program itself, so they follow it too.
            return { ...e, ...(untouched ? { name: defaultEx.name } : {}), substitutions: defaultEx.substitutions };
          }),
        };
      }),
    };
  });
}
