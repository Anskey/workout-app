import type { SetLog, WeightUnit, WorkoutDay, WorkoutProgram, WorkoutSessionLog } from '@/types';
import { kgToDisplayValue } from './units';

/** Which week's prescription (sets/reps/RPE) is due for this exact day, based purely on how
 * many times that day has already been logged before the date in question — a day's own
 * progression table is indexed by its own occurrence count, not a shared calendar-week
 * pointer, so "Pull #2" and "Push #2" each advance only when THEY are actually done. Wraps
 * back to week 1 once every prescribed week has been used once, so a repeated mesocycle
 * (as in a real, ongoing training log) keeps making sense instead of freezing on the final
 * week's numbers forever. */
export function getEffectiveWeekForDay(
  day: WorkoutDay | undefined,
  sessionLogs: WorkoutSessionLog[],
  programId: string | undefined,
  beforeDate?: string
): number {
  if (!day) return 1;
  let maxWeek = 0;
  day.exercises.forEach((e) => e.weeklyProgression?.forEach((w) => { if (w.week > maxWeek) maxWeek = w.week; }));
  if (maxWeek === 0) return 1;
  const count = sessionLogs.filter(
    (l) => l.programId === programId && l.dayId === day.id && (!beforeDate || l.date < beforeDate)
  ).length;
  return (count % maxWeek) + 1;
}

/** The next day due in the program's rotation, based on whatever day was most recently
 * logged — so the app can pick up where you left off instead of always starting back at
 * day one. Falls back to the first day if nothing's been logged yet for this program, or
 * if the last-logged day no longer exists in it (e.g. after a program edit). */
export function getNextWorkoutDay(program: WorkoutProgram | undefined, sessionLogs: WorkoutSessionLog[]): WorkoutDay | undefined {
  if (!program || program.days.length === 0) return undefined;
  const logsForProgram = sessionLogs.filter((l) => l.programId === program.id);
  if (logsForProgram.length === 0) return program.days[0];
  const lastLog = [...logsForProgram].sort((a, b) => b.date.localeCompare(a.date))[0];
  const idx = program.days.findIndex((d) => d.id === lastLog.dayId);
  if (idx === -1) return program.days[0];
  return program.days[(idx + 1) % program.days.length];
}

/** Extracts a usable set count (1-6) from a workingSets prescription string like "2-3" or "2 per leg". */
export function parseSetCount(workingSets: string | undefined): number {
  const match = (workingSets ?? '').match(/\d+/g);
  if (!match || match.length === 0) return 2;
  const n = Math.max(...match.map(Number));
  return Math.min(6, Math.max(1, n));
}

/** Most recent session log (by date) that includes a log for the given exercise name.
 * Name-based, so it misses history logged under a different exercise name for the same
 * slot (a substitution, or the underlying program prescribing a different exercise in a
 * later week) — prefer getLastSlotLog when a dayId/exerciseId are available. */
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

export interface SlotHistoryEntry {
  date: string;
  exerciseName: string;
  sets: SetLog[];
}

/** Every past logged entry for this exact program slot (day + exercise id), oldest first —
 * regardless of what exercise name was used each time. A slot's actual exercise can change
 * over time (a substitution, or the underlying program prescribing something different in
 * a later week), so matching by slot instead of by name is what makes "last time" and the
 * lift-history chart find that history at all. */
export function getSlotHistory(sessionLogs: WorkoutSessionLog[], dayId: string, exerciseId: string): SlotHistoryEntry[] {
  const sorted = [...sessionLogs].sort((a, b) => a.date.localeCompare(b.date));
  const points: SlotHistoryEntry[] = [];
  sorted.forEach((log) => {
    if (log.dayId !== dayId) return;
    const match = log.exerciseLogs.find((e) => e.exerciseId === exerciseId);
    if (match && match.sets.length > 0) points.push({ date: log.date, exerciseName: match.exerciseName, sets: match.sets });
  });
  return points;
}

/** The most recently logged entry for this exact slot, whatever exercise it was at the time. */
export function getLastSlotLog(sessionLogs: WorkoutSessionLog[], dayId: string, exerciseId: string): SlotHistoryEntry | undefined {
  const history = getSlotHistory(sessionLogs, dayId, exerciseId);
  return history[history.length - 1];
}

/** The most recently logged entry for this slot under this exact exercise name — used for
 * pre-filling weight, since a substitution can load very differently than the default (or
 * than a different substitution), so "last logged for this slot at all" isn't a safe stand-in
 * for "last time I did this specific exercise." */
export function getLastSlotLogForName(
  sessionLogs: WorkoutSessionLog[],
  dayId: string,
  exerciseId: string,
  name: string
): SlotHistoryEntry | undefined {
  const history = getSlotHistory(sessionLogs, dayId, exerciseId).filter((e) => e.exerciseName === name);
  return history[history.length - 1];
}

/** The heaviest set (ties broken by reps) from the last time this slot was logged. */
export function getLastSlotTopSet(sessionLogs: WorkoutSessionLog[], dayId: string, exerciseId: string): SetLog | undefined {
  const last = getLastSlotLog(sessionLogs, dayId, exerciseId);
  return last ? bestSet(last.sets) : undefined;
}

/** Every past session's best set for this slot, oldest first — the data behind a lift-history graph. */
export function getSlotExerciseHistory(sessionLogs: WorkoutSessionLog[], dayId: string, exerciseId: string): HistoryPoint[] {
  return getSlotHistory(sessionLogs, dayId, exerciseId)
    .map((entry) => ({ date: entry.date, topSet: bestSet(entry.sets) }))
    .filter((p): p is HistoryPoint => p.topSet != null);
}

export function formatSet(set: SetLog | undefined, unit: WeightUnit): string {
  if (!set) return '';
  const weight = set.weightKg != null ? `${kgToDisplayValue(set.weightKg, unit)}${unit}` : 'bodyweight';
  const reps = set.reps != null ? `${set.reps}${set.partialReps ? `+${set.partialReps}` : ''}` : undefined;
  return reps ? `${weight} × ${reps}` : weight;
}
