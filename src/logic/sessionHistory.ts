import type { SetLog, WorkoutSessionLog } from '@/types';

/** Extracts a usable set count (1-6) from a workingSets prescription string like "2-3" or "2 per leg". */
export function parseSetCount(workingSets: string | undefined): number {
  const match = (workingSets ?? '').match(/\d+/g);
  if (!match || match.length === 0) return 2;
  const n = Math.max(...match.map(Number));
  return Math.min(6, Math.max(1, n));
}

/** Most recent session log (by date) that includes a log for the given exercise name. */
export function getLastExerciseLog(sessionLogs: WorkoutSessionLog[], exerciseName: string): SetLog[] | undefined {
  const sorted = [...sessionLogs].sort((a, b) => b.date.localeCompare(a.date));
  for (const log of sorted) {
    const match = log.exerciseLogs.find((e) => e.exerciseName === exerciseName);
    if (match && match.sets.some((s) => s.weightKg != null || s.reps != null)) return match.sets;
  }
  return undefined;
}

export function formatSets(sets: SetLog[] | undefined): string {
  if (!sets || sets.length === 0) return '';
  return sets
    .filter((s) => s.weightKg != null || s.reps != null)
    .map((s) => `${s.weightKg ?? '—'}kg×${s.reps ?? '—'}`)
    .join(', ');
}
