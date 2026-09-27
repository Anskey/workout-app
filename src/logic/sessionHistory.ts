import type { SetLog, WeightUnit, WorkoutSessionLog } from '@/types';
import { kgToDisplayValue } from './units';

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

/** The heaviest set (ties broken by reps) from the last session that included this exercise. */
export function getLastTopSet(sessionLogs: WorkoutSessionLog[], exerciseName: string): SetLog | undefined {
  const sets = getLastExerciseLog(sessionLogs, exerciseName);
  if (!sets) return undefined;
  return sets
    .filter((s) => s.weightKg != null || s.reps != null)
    .reduce<SetLog | undefined>((best, s) => {
      if (!best) return s;
      const w = s.weightKg ?? 0;
      const bw = best.weightKg ?? 0;
      if (w !== bw) return w > bw ? s : best;
      return (s.reps ?? 0) > (best.reps ?? 0) ? s : best;
    }, undefined);
}

export function formatSet(set: SetLog | undefined, unit: WeightUnit): string {
  if (!set) return '';
  const weight = set.weightKg != null ? `${kgToDisplayValue(set.weightKg, unit)}${unit}` : 'bodyweight';
  return set.reps != null ? `${weight} × ${set.reps}` : weight;
}
