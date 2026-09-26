import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Exercise,
  MeasurementEntry,
  NutritionEntry,
  UserProfile,
  WorkoutDay,
  WorkoutProgram,
} from '@/types';
import { createSeedProgram } from '@/data/seedProgram';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  heightCm: 175,
  sex: 'male',
  goal: 'bulk',
  activityLevel: 'moderate',
  onboardingComplete: false,
};

interface AppState {
  profile: UserProfile;
  programs: WorkoutProgram[];
  activeProgramId: string;
  measurements: MeasurementEntry[];
  nutritionLogs: NutritionEntry[];

  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (profile: UserProfile, firstMeasurement: Omit<MeasurementEntry, 'id'>) => void;

  addProgram: (program: Omit<WorkoutProgram, 'id' | 'createdAt'>) => string;
  updateProgram: (program: WorkoutProgram) => void;
  deleteProgram: (id: string) => void;
  setActiveProgram: (id: string) => void;

  upsertDay: (programId: string, day: WorkoutDay) => void;
  deleteDay: (programId: string, dayId: string) => void;
  reorderDays: (programId: string, days: WorkoutDay[]) => void;

  upsertExercise: (programId: string, dayId: string, exercise: Exercise) => void;
  deleteExercise: (programId: string, dayId: string, exerciseId: string) => void;

  addMeasurement: (entry: Omit<MeasurementEntry, 'id'>) => void;
  updateMeasurement: (entry: MeasurementEntry) => void;
  deleteMeasurement: (id: string) => void;

  upsertNutritionLog: (entry: Omit<NutritionEntry, 'id'> & { id?: string }) => void;
  deleteNutritionLog: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      programs: [createSeedProgram()],
      activeProgramId: 'seed-program-ppl',
      measurements: [],
      nutritionLogs: [],

      setProfile: (partial) => set((s) => ({ profile: { ...s.profile, ...partial } })),

      completeOnboarding: (profile, firstMeasurement) =>
        set((s) => ({
          profile: { ...profile, onboardingComplete: true },
          measurements: [...s.measurements, { ...firstMeasurement, id: generateId() }],
        })),

      addProgram: (program) => {
        const id = generateId();
        set((s) => ({
          programs: [...s.programs, { ...program, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateProgram: (program) =>
        set((s) => ({ programs: s.programs.map((p) => (p.id === program.id ? program : p)) })),
      deleteProgram: (id) =>
        set((s) => {
          const programs = s.programs.filter((p) => p.id !== id);
          const activeProgramId = s.activeProgramId === id ? (programs[0]?.id ?? '') : s.activeProgramId;
          return { programs, activeProgramId };
        }),
      setActiveProgram: (id) => set({ activeProgramId: id }),

      upsertDay: (programId, day) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            const exists = p.days.some((d) => d.id === day.id);
            return { ...p, days: exists ? p.days.map((d) => (d.id === day.id ? day : d)) : [...p.days, day] };
          }),
        })),
      deleteDay: (programId, dayId) =>
        set((s) => ({
          programs: s.programs.map((p) => (p.id === programId ? { ...p, days: p.days.filter((d) => d.id !== dayId) } : p)),
        })),
      reorderDays: (programId, days) =>
        set((s) => ({ programs: s.programs.map((p) => (p.id === programId ? { ...p, days } : p)) })),

      upsertExercise: (programId, dayId, exercise) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const exists = d.exercises.some((e) => e.id === exercise.id);
                return {
                  ...d,
                  exercises: exists
                    ? d.exercises.map((e) => (e.id === exercise.id ? exercise : e))
                    : [...d.exercises, exercise],
                };
              }),
            };
          }),
        })),
      deleteExercise: (programId, dayId, exerciseId) =>
        set((s) => ({
          programs: s.programs.map((p) => {
            if (p.id !== programId) return p;
            return {
              ...p,
              days: p.days.map((d) => (d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) } : d)),
            };
          }),
        })),

      addMeasurement: (entry) => set((s) => ({ measurements: [...s.measurements, { ...entry, id: generateId() }] })),
      updateMeasurement: (entry) =>
        set((s) => ({ measurements: s.measurements.map((m) => (m.id === entry.id ? entry : m)) })),
      deleteMeasurement: (id) => set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),

      upsertNutritionLog: (entry) =>
        set((s) => {
          if (entry.id) {
            return { nutritionLogs: s.nutritionLogs.map((n) => (n.id === entry.id ? { ...n, ...entry, id: entry.id } as NutritionEntry : n)) };
          }
          const existing = s.nutritionLogs.find((n) => n.date === entry.date);
          if (existing) {
            return {
              nutritionLogs: s.nutritionLogs.map((n) => (n.id === existing.id ? { ...n, ...entry, id: existing.id } : n)),
            };
          }
          return { nutritionLogs: [...s.nutritionLogs, { ...entry, id: generateId() } as NutritionEntry] };
        }),
      deleteNutritionLog: (id) => set((s) => ({ nutritionLogs: s.nutritionLogs.filter((n) => n.id !== id) })),
    }),
    {
      name: 'workout-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useActiveProgram() {
  const programs = useStore((s) => s.programs);
  const activeProgramId = useStore((s) => s.activeProgramId);
  return programs.find((p) => p.id === activeProgramId) ?? programs[0];
}

export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
