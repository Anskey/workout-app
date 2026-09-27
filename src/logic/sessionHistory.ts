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

/** The heaviest set in a list (ties broken by reps). */
function bestSet(sets: SetLog[]): SetLog | undefined {
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

/** The heaviest set (ties broken by reps) from the last session that included this exercise. */
export function getLastTopSet(sessionLogs: WorkoutSessionLog[], exerciseName: string): SetLog | undefined {
  const sets = getLastExerciseLog(sessionLogs, exerciseName);
  if (!sets) return undefined;
  return bestSet(sets);
}

export interface HistoryPoint {
  date: string;
  topSet: SetLog;
}

/** Every past session's best set for this exercise, oldest first — the data behind a lift-history graph. */
export function getExerciseHistory(sessionLogs: WorkoutSessionLog[], exerciseName: string): HistoryPoint[] {
  const sorted = [...sessionLogs].sort((a, b) => a.date.localeCompare(b.date));
  const points: HistoryPoint[] = [];
  sorted.forEach((log) => {
    const match = log.exerciseLogs.find((e) => e.exerciseName === exerciseName);
    if (!match) return;
    const top = bestSet(match.sets);
    if (top) points.push({ date: log.date, topSet: top });
  });
  return points;
}

export function formatSet(set: SetLog | undefined, unit: WeightUnit): string {
  if (!set) return '';
  const weight = set.weightKg != null ? `${kgToDisplayValue(set.weightKg, unit)}${unit}` : 'bodyweight';
  const reps = set.reps != null ? `${set.reps}${set.partialReps ? `+${set.partialReps}` : ''}` : undefined;
  return reps ? `${weight} × ${reps}` : weight;
}
