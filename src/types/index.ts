export type Sex = 'male' | 'female';
export type Goal = 'bulk' | 'cut' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WeightUnit = 'kg' | 'lb';
export type LengthUnit = 'cm' | 'in';
/** Which body-proportion archetype "ideal" comparisons and the body figure are measured against. */
export type IdealPreset = 'editorial' | 'couture' | 'athletic' | 'bodybuilding';

export interface UserProfile {
  name: string;
  heightCm: number;
  sex: Sex;
  goal: Goal;
  /** 'auto' derives the effective nutrition goal from how the latest measurements compare
   * to the selected reference preset, instead of using `goal` directly. */
  goalMode: 'manual' | 'auto';
  activityLevel: ActivityLevel;
  onboardingComplete: boolean;
  weightUnit: WeightUnit;
  lengthUnit: LengthUnit;
  idealPreset: IdealPreset;
}

export type MuscleGroup =
  | 'Chest'
  | 'Back Width'
  | 'Back Thickness'
  | 'Shoulders'
  | 'Rear Delts'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs'
  | 'Neck'
  | 'Traps'
  | 'Adductors'
  | 'Weak Point';

export interface WeekPrescription {
  week: number;
  warmupSets?: string;
  workingSets: string;
  reps: string;
  earlyRPE?: string;
  lastRPE?: string;
  rest?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  warmupSets?: string;
  workingSets: string;
  reps: string;
  earlyRPE?: string;
  lastRPE?: string;
  rest?: string;
  substitutions?: string[];
  isWeakPointSlot?: boolean;
  /** Optional week-by-week prescriptions (1-based, relative to the day's block). Falls back to the base fields above when absent or missing a given week. */
  weeklyProgression?: WeekPrescription[];
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
  /** Which training block this day belongs to, for programs with periodized blocks (e.g. a "Climb" and a "Grind" phase). */
  block?: number;
  blockLabel?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  createdAt: string;
  days: WorkoutDay[];
  /** Which block/week is currently being viewed, for programs whose days carry weeklyProgression. */
  currentBlock?: number;
  currentWeek?: number;
}

export type MeasurementKey =
  | 'weightKg'
  | 'neckCm'
  | 'shouldersCm'
  | 'chestCm'
  | 'waistCm'
  | 'hipsCm'
  | 'bicepCm'
  | 'forearmCm'
  | 'thighCm'
  | 'calfCm';

export type MeasurementEntry = {
  id: string;
  date: string;
} & Partial<Record<MeasurementKey, number>>;

export interface NutritionEntry {
  id: string;
  date: string;
  calories?: number;
  proteinG?: number;
  weightKg?: number;
}

export interface SetLog {
  weightKg?: number;
  reps?: number;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  programId: string;
  dayId: string;
  dayName: string;
  exerciseLogs: ExerciseSessionLog[];
}
