import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Exercise,
  MeasurementEntry,
  NutritionEntry,
  UserProfile,
  WorkoutDay,
  WorkoutProgram,
  WorkoutSessionLog,
} from '@/types';
import { createSeedProgram, getDefaultProgram } from '@/data/seedProgram';

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
  weightUnit: 'kg',
  lengthUnit: 'cm',
};

interface AppState {
  profile: UserProfile;
  programs: WorkoutProgram[];
  activeProgramId: string;
  measurements: MeasurementEntry[];
  nutritionLogs: NutritionEntry[];
  sessionLogs: WorkoutSessionLog[];

  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: (profile: UserProfile, firstMeasurement: Omit<MeasurementEntry, 'id'>) => void;

  addProgram: (program: Omit<WorkoutProgram, 'id' | 'createdAt'>) => string;
  updateProgram: (program: WorkoutProgram) => void;
  deleteProgram: (id: string) => void;
  setActiveProgram: (id: string) => void;

  upsertDay: (programId: string, day: WorkoutDay) => void;
  deleteDay: (programId: string, dayId: string) => void;
  reorderDays: (programId: string, days: WorkoutDay[]) => void;
  setProgramWeek: (programId: string, block: number, week: number) => void;

  upsertExercise: (programId: string, dayId: string, exercise: Exercise) => void;
  deleteExercise: (programId: string, dayId: string, exerciseId: string) => void;

  resetExerciseToDefault: (programId: string, dayId: string, exerciseId: string) => void;
  resetDayToDefault: (programId: string, dayId: string) => void;
  resetProgramToDefault: (programId: string) => void;

  addMeasurement: (entry: Omit<MeasurementEntry, 'id'>) => void;
  updateMeasurement: (entry: MeasurementEntry) => void;
  deleteMeasurement: (id: string) => void;

  upsertNutritionLog: (entry: Omit<NutritionEntry, 'id'> & { id?: string }) => void;
  deleteNutritionLog: (id: string) => void;

  upsertSessionLog: (entry: Omit<WorkoutSessionLog, 'id'> & { id?: string }) => void;
  deleteSessionLog: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      programs: [createSeedProgram()],
      activeProgramId: 'seed-program-ppl',
      measurements: [],
      nutritionLogs: [],
      sessionLogs: [],

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
      setProgramWeek: (programId, block, week) =>
        set((s) => ({
          programs: s.programs.map((p) => (p.id === programId ? { ...p, currentBlock: block, currentWeek: week } : p)),
        })),

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

      resetExerciseToDefault: (programId, dayId, exerciseId) =>
        set((s) => {
          const defaultProgram = getDefaultProgram(programId);
          const defaultExercise = defaultProgram?.days.find((d) => d.id === dayId)?.exercises.find((e) => e.id === exerciseId);
          if (!defaultExercise) return s;
          return {
            programs: s.programs.map((p) => {
              if (p.id !== programId) return p;
              return { ...p, days: p.days.map((d) => (d.id !== dayId ? d : { ...d, exercises: d.exercises.map((e) => (e.id === exerciseId ? defaultExercise : e)) })) };
            }),
          };
        }),
      resetDayToDefault: (programId, dayId) =>
        set((s) => {
          const defaultDay = getDefaultProgram(programId)?.days.find((d) => d.id === dayId);
          if (!defaultDay) return s;
          return { programs: s.programs.map((p) => (p.id !== programId ? p : { ...p, days: p.days.map((d) => (d.id === dayId ? defaultDay : d)) })) };
        }),
      resetProgramToDefault: (programId) =>
        set((s) => {
          const defaultProgram = getDefaultProgram(programId);
          if (!defaultProgram) return s;
          return { programs: s.programs.map((p) => (p.id === programId ? defaultProgram : p)) };
        }),

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

      upsertSessionLog: (entry) =>
        set((s) => {
          if (entry.id) {
            return {
              sessionLogs: s.sessionLogs.map((l) => (l.id === entry.id ? ({ ...l, ...entry, id: entry.id } as WorkoutSessionLog) : l)),
            };
          }
          const existing = s.sessionLogs.find((l) => l.programId === entry.programId && l.dayId === entry.dayId && l.date === entry.date);
          if (existing) {
            return {
              sessionLogs: s.sessionLogs.map((l) => (l.id === existing.id ? { ...l, ...entry, id: existing.id } : l)),
            };
          }
          return { sessionLogs: [...s.sessionLogs, { ...entry, id: generateId() } as WorkoutSessionLog] };
        }),
      deleteSessionLog: (id) => set((s) => ({ sessionLogs: s.sessionLogs.filter((l) => l.id !== id) })),
    }),
    {
      name: 'workout-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        let state = (persistedState ?? {}) as { programs?: WorkoutProgram[]; profile?: UserProfile; [key: string]: unknown };
        if (version < 3) {
          const seed = createSeedProgram();
          const programs = Array.isArray(state.programs) ? [...state.programs] : [];
          const idx = programs.findIndex((p) => p.id === 'seed-program-ppl');
          if (idx >= 0) programs[idx] = seed;
          else programs.unshift(seed);
          state = { ...state, programs, sessionLogs: Array.isArray((state as any).sessionLogs) ? (state as any).sessionLogs : [] };
        }
        if (version < 5) {
          state = {
            ...state,
            profile: {
              ...DEFAULT_PROFILE,
              ...state.profile,
              weightUnit: state.profile?.weightUnit ?? 'kg',
              lengthUnit: state.profile?.lengthUnit ?? 'cm',
            },
          };
        }
        return state;
      },
    }
  )
);

export function useActiveProgram() {
  const programs = useStore((s) => s.programs);
  const activeProgramId = useStore((s) => s.activeProgramId);
  return programs.find((p) => p.id === activeProgramId) ?? programs[0];
}

const subscribeHydration = (onChange: () => void) => useStore.persist.onFinishHydration(onChange);
const getHydrated = () => useStore.persist.hasHydrated();

export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
}
