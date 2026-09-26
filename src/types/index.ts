export type Sex = 'male' | 'female';
export type Goal = 'bulk' | 'cut' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  name: string;
  heightCm: number;
  sex: Sex;
  goal: Goal;
  activityLevel: ActivityLevel;
  onboardingComplete: boolean;
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
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  createdAt: string;
  days: WorkoutDay[];
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
