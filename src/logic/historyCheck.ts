import type { WorkoutSessionLog } from '@/types';

export interface WeightFlag {
  logId: string;
  programId: string;
  dayId: string;
  date: string;
  exerciseName: string;
  weightKg: number;
  prevKg: number;
  prevDate: string;
  nextKg?: number;
  nextDate?: string;
  /** "spike": out of line with the entries on both sides (which agree with each other) — most
   * likely a typo or a set logged under the wrong exercise. "jump": the weight stepped up or
   * down and stayed there (could be real progress, a deload, or a different variation). */
  kind: 'spike' | 'jump';
  changePct: number;
}

interface Point {
  logId: string;
  programId: string;
  dayId: string;
  date: string;
  name: string;
  weightKg: number;
}

// Ignore tiny absolute changes (e.g. 5kg -> 7.5kg is +50% but just one plate).
const MIN_ABS_KG = 4;

const pct = (from: number, to: number) => Math.abs(to - from) / from;

/** Scans every logged exercise for sudden changes in its heaviest-set weight. Entries are only
 * compared to others for the same program slot *and* the same logged exercise name, so
 * deliberately swapping to a different exercise isn't flagged as a jump. */
export function findWeightJumps(sessionLogs: WorkoutSessionLog[], thresholdPct: number): WeightFlag[] {
  const t = thresholdPct / 100;
  const series = new Map<string, Point[]>();

  [...sessionLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((log) => {
      log.exerciseLogs.forEach((e) => {
        const weights = e.sets.map((s) => s.weightKg).filter((w): w is number => w != null && w > 0);
        if (weights.length === 0) return;
        const key = `${log.programId}|${log.dayId}|${e.exerciseId}|${e.exerciseName.trim().toLowerCase()}`;
        if (!series.has(key)) series.set(key, []);
        series.get(key)!.push({
          logId: log.id,
          programId: log.programId,
          dayId: log.dayId,
          date: log.date,
          name: e.exerciseName,
          weightKg: Math.max(...weights),
        });
      });
    });

  const flags: WeightFlag[] = [];
  series.forEach((points) => {
    let lastSpike = -1;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const next = points[i + 1];
      if (i - 1 === lastSpike) continue; // the return to normal after a spike isn't a second problem
      if (pct(prev.weightKg, cur.weightKg) < t || Math.abs(cur.weightKg - prev.weightKg) < MIN_ABS_KG) continue;

      const isSpike =
        !!next && pct(next.weightKg, cur.weightKg) >= t && pct(prev.weightKg, next.weightKg) < t / 2;
      if (isSpike) lastSpike = i;

      flags.push({
        logId: cur.logId,
        programId: cur.programId,
        dayId: cur.dayId,
        date: cur.date,
        exerciseName: cur.name,
        weightKg: cur.weightKg,
        prevKg: prev.weightKg,
        prevDate: prev.date,
        nextKg: next?.weightKg,
        nextDate: next?.date,
        kind: isSpike ? 'spike' : 'jump',
        changePct: Math.round(pct(prev.weightKg, cur.weightKg) * 100),
      });
    }
  });

  return flags.sort((a, b) => (a.kind === b.kind ? b.changePct - a.changePct : a.kind === 'spike' ? -1 : 1));
}
