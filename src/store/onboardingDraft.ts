import { create } from 'zustand';
import type { ActivityLevel, Goal, MeasurementKey, Sex, WeightUnit } from '@/types';

interface OnboardingDraft {
  name: string;
  heightCm: number;
  sex: Sex;
  goal: Goal;
  activityLevel: ActivityLevel;
  weightUnit: WeightUnit;
  measurements: Partial<Record<MeasurementKey, number>>;
  setField: <K extends keyof Omit<OnboardingDraft, 'measurements' | 'setField' | 'setMeasurement'>>(
    key: K,
    value: OnboardingDraft[K]
  ) => void;
  setMeasurement: (key: MeasurementKey, value: number | undefined) => void;
}

export const useOnboardingDraft = create<OnboardingDraft>((set) => ({
  name: '',
  heightCm: 175,
  sex: 'male',
  goal: 'bulk',
  activityLevel: 'moderate',
  weightUnit: 'kg',
  measurements: {},
  setField: (key, value) => set({ [key]: value } as never),
  setMeasurement: (key, value) => set((s) => ({ measurements: { ...s.measurements, [key]: value } })),
}));
