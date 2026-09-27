import type { Goal, MeasurementEntry, MeasurementKey, MuscleGroup, NutritionEntry, UserProfile, WorkoutProgram } from '@/types';
import { GROW_TOWARD_IDEAL, MEASUREMENT_LABELS, MEASUREMENT_TO_MUSCLE, getIdealMeasurements } from '@/data/idealRatios';
import { findWeakPoint } from '@/data/weakPoints';
import { daysSince } from './dates';

export const MEASUREMENT_REMINDER_INTERVAL_DAYS = 7;

export function getLatestMeasurement(measurements: MeasurementEntry[]): MeasurementEntry | undefined {
  if (measurements.length === 0) return undefined;
  return [...measurements].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function measurementReminderInfo(measurements: MeasurementEntry[]) {
  const latest = getLatestMeasurement(measurements);
  if (!latest) return { due: true, daysSinceLast: null as number | null };
  const since = daysSince(latest.date);
  return { due: since >= MEASUREMENT_REMINDER_INTERVAL_DAYS, daysSinceLast: since };
}

export interface MeasurementComparison {
  key: Exclude<MeasurementKey, 'weightKg'>;
  label: string;
  actual: number;
  ideal: number;
  diffPct: number;
  growToward: boolean;
  status: 'lagging' | 'onTarget' | 'exceeds';
}

const LAG_THRESHOLD_PCT = 8;

export function compareToIdeal(latest: MeasurementEntry | undefined, profile: UserProfile): MeasurementComparison[] {
  if (!latest) return [];
  const ideal = getIdealMeasurements(profile.heightCm, profile.sex, profile.idealPreset);
  const keys = Object.keys(ideal) as Exclude<MeasurementKey, 'weightKg'>[];
  const out: MeasurementComparison[] = [];
  keys.forEach((key) => {
    const actual = latest[key];
    if (actual === undefined || actual === null) return;
    const idealVal = ideal[key];
    const growToward = GROW_TOWARD_IDEAL[key];
    const diffPct = ((actual - idealVal) / idealVal) * 100;
    // For "grow toward" measurements, being below ideal is lagging.
    // For waist (grow=false), being above ideal is lagging (i.e. "too high").
    const effectiveDiff = growToward ? diffPct : -diffPct;
    let status: MeasurementComparison['status'] = 'onTarget';
    if (effectiveDiff <= -LAG_THRESHOLD_PCT) status = 'lagging';
    else if (effectiveDiff >= LAG_THRESHOLD_PCT) status = 'exceeds';
    out.push({ key, label: MEASUREMENT_LABELS[key], actual, ideal: idealVal, diffPct, growToward, status });
  });
  return out;
}

/**
 * Derives a nutrition goal from how the latest measurements compare to the selected
 * reference: a waist that runs hot takes priority (cut), otherwise most measurements
 * sitting below reference calls for size (bulk), and a build that's already close to
 * reference across the board calls for holding steady (maintain).
 */
export function getSuggestedGoal(comparisons: MeasurementComparison[]): Goal {
  if (comparisons.length === 0) return 'maintain';
  const waist = comparisons.find((c) => c.key === 'waistCm');
  if (waist?.status === 'lagging') return 'cut';

  const others = comparisons.filter((c) => c.key !== 'waistCm');
  if (others.length === 0) return 'maintain';
  const laggingCount = others.filter((c) => c.status === 'lagging').length;
  const exceedsCount = others.filter((c) => c.status === 'exceeds').length;
  if (laggingCount > others.length / 2) return 'bulk';
  if (exceedsCount > others.length / 2) return 'cut';
  return 'maintain';
}

export interface WorkoutSuggestion {
  muscle: MuscleGroup;
  headline: string;
  detail: string;
  options: string[];
  hasWeakPointSlot: boolean;
}

export function getWorkoutSuggestions(
  comparisons: MeasurementComparison[],
  activeProgram: WorkoutProgram | undefined
): WorkoutSuggestion[] {
  const laggingWithMuscle = comparisons
    .filter((c) => c.status === 'lagging')
    .map((c) => ({ c, muscle: MEASUREMENT_TO_MUSCLE[c.key] }))
    .filter((x): x is { c: MeasurementComparison; muscle: MuscleGroup } => !!x.muscle);

  const hasWeakPointSlot = !!activeProgram?.days.some((d) => d.exercises.some((e) => e.isWeakPointSlot));

  return laggingWithMuscle.map(({ c, muscle }) => {
    const wp = findWeakPoint(muscle);
    const options = wp ? [...wp.optionSetA, ...wp.optionSetB].filter(Boolean) : [];
    const pct = Math.abs(c.diffPct).toFixed(0);
    const headline = `${c.label} is ~${pct}% below your reference`;
    let detail: string;
    if (wp?.note) {
      detail = wp.note;
    } else if (options.length && hasWeakPointSlot) {
      detail = `Use one of your Weak Point slots on Arms Day for ${muscle === 'Quads' || muscle === 'Calves' || muscle === 'Glutes' || muscle === 'Hamstrings' ? 'a leg' : 'an'} exercise targeting ${muscle}.`;
    } else if (options.length) {
      detail = `Consider swapping in a dedicated ${muscle} exercise this week.`;
    } else {
      detail = `Keep an eye on ${muscle} — no dedicated substitution list available yet.`;
    }
    return { muscle, headline, detail, options, hasWeakPointSlot };
  });
}

export interface NutritionSuggestion {
  avgCalories: number | null;
  avgProteinG: number | null;
  proteinTargetG: number | null;
  weeklyWeightChangePct: number | null;
  calorieAdjustment: number;
  messages: string[];
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const GOAL_WEEKLY_RANGE: Record<Goal, [number, number]> = {
  bulk: [0.25, 0.5],
  cut: [-1, -0.5],
  maintain: [-0.25, 0.25],
};

export function getNutritionSuggestion(
  nutritionLogs: NutritionEntry[],
  latestMeasurement: MeasurementEntry | undefined,
  goal: Goal
): NutritionSuggestion {
  const sorted = [...nutritionLogs].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);
  const avgCalories = average(last7.map((l) => l.calories).filter((v): v is number => v != null));
  const avgProteinG = average(last7.map((l) => l.proteinG).filter((v): v is number => v != null));

  const latestWeight = last7.slice().reverse().find((l) => l.weightKg != null)?.weightKg ?? latestMeasurement?.weightKg;
  const proteinTargetG = latestWeight ? Math.round(latestWeight * 2.0) : null;

  const weightEntries = sorted.filter((l) => l.weightKg != null);
  let weeklyWeightChangePct: number | null = null;
  if (weightEntries.length >= 4) {
    const last14 = weightEntries.slice(-14);
    const midpoint = Math.floor(last14.length / 2);
    const earlierAvg = average(last14.slice(0, midpoint).map((l) => l.weightKg as number));
    const laterAvg = average(last14.slice(midpoint).map((l) => l.weightKg as number));
    if (earlierAvg && laterAvg) {
      const spanDays = Math.max(
        1,
        (new Date(last14[last14.length - 1].date).getTime() - new Date(last14[0].date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalChangePct = ((laterAvg - earlierAvg) / earlierAvg) * 100;
      weeklyWeightChangePct = (totalChangePct / spanDays) * 7;
    }
  }

  const messages: string[] = [];
  let calorieAdjustment = 0;

  if (avgProteinG != null && proteinTargetG != null) {
    const gap = proteinTargetG - avgProteinG;
    if (gap > 15) {
      messages.push(`Your protein has averaged ${Math.round(avgProteinG)}g/day this week — aim for +${Math.round(gap)}g/day to hit ~${proteinTargetG}g.`);
    } else {
      messages.push(`Protein looks on track (~${Math.round(avgProteinG)}g/day vs a ${proteinTargetG}g target).`);
    }
  }

  if (weeklyWeightChangePct != null) {
    const [lo, hi] = GOAL_WEEKLY_RANGE[goal];
    if (weeklyWeightChangePct < lo) {
      calorieAdjustment = goal === 'cut' ? -150 : 200;
      messages.push(
        goal === 'cut'
          ? `You're losing faster than planned (${weeklyWeightChangePct.toFixed(2)}%/week) — consider +150 kcal/day to protect muscle.`
          : `Weight is trending flat or down (${weeklyWeightChangePct.toFixed(2)}%/week) for a ${goal} goal — try +200 kcal/day.`
      );
    } else if (weeklyWeightChangePct > hi) {
      calorieAdjustment = goal === 'bulk' ? -150 : -200;
      messages.push(
        goal === 'bulk'
          ? `Weight is climbing faster than ideal (${weeklyWeightChangePct.toFixed(2)}%/week) — trim ~150 kcal/day to limit fat gain.`
          : `Weight change (${weeklyWeightChangePct.toFixed(2)}%/week) is outside your ${goal} target — trim ~200 kcal/day.`
      );
    } else {
      messages.push(`Weight trend (${weeklyWeightChangePct.toFixed(2)}%/week) is right on track for your ${goal} goal.`);
    }
  } else {
    messages.push('Log weight daily for a couple weeks to unlock calorie-trend suggestions.');
  }

  return { avgCalories, avgProteinG, proteinTargetG, weeklyWeightChangePct, calorieAdjustment, messages };
}
