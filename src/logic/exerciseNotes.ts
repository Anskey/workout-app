import { EXERCISE_NOTES } from '@/data/exerciseNotes';

const noteKey = (name: string) => name.trim().toLowerCase();

const BUILT_IN_NOTES: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_NOTES).map(([name, note]) => [noteKey(name), note])
);

/** The note for an exercise: the user's own edit if there is one (even an empty one,
 * meaning they cleared it), otherwise the built-in note, otherwise empty. */
export function getExerciseNote(name: string, userNotes: Record<string, string> | undefined): string {
  const key = noteKey(name);
  if (userNotes && key in userNotes) return userNotes[key];
  return BUILT_IN_NOTES[key] ?? '';
}
