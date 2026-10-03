import { EXERCISE_NOTES } from '@/data/exerciseNotes';
import { canonicalExerciseName } from '@/data/exerciseAliases';

const noteKey = (name: string) => name.trim().toLowerCase();

const BUILT_IN_NOTES: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_NOTES).map(([name, note]) => [noteKey(name), note])
);

/** The note for an exercise: the user's own edit if there is one (even an empty one,
 * meaning they cleared it), otherwise the built-in note, otherwise empty. */
export function getExerciseNote(name: string, userNotes: Record<string, string> | undefined): string {
  const key = noteKey(canonicalExerciseName(name));
  const rawKey = noteKey(name);
  if (userNotes && key in userNotes) return userNotes[key];
  if (userNotes && rawKey in userNotes) return userNotes[rawKey];
  return BUILT_IN_NOTES[key] ?? '';
}
