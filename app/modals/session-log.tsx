import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { formatSet, getLastExerciseLog, getLastTopSet, parseSetCount } from '@/logic/sessionHistory';
import { formatLongDate, todayISODate } from '@/logic/dates';
import { displayValueToKg, kgToDisplayValue } from '@/logic/units';
import type { Exercise, SetLog, WeekPrescription, WorkoutSessionLog } from '@/types';

function currentPrescription(exercise: Exercise, week: number): WeekPrescription | Exercise {
  return exercise.weeklyProgression?.find((w) => w.week === week) ?? exercise;
}

/** RPE target for one specific set row: every set but the last uses the earlier-sets RPE,
 * the final set uses the (usually higher) last-set RPE. Falls back to whichever is present. */
function rpeForSet(prescription: WeekPrescription | Exercise, index: number, totalSets: number): string | undefined {
  const isLast = index === totalSets - 1;
  if (isLast) return prescription.lastRPE ?? prescription.earlyRPE;
  return prescription.earlyRPE ?? prescription.lastRPE;
}

/** Blank set rows for an exercise, with weights pre-filled from the last time it was done. */
function initialSets(exercise: Exercise, week: number, sessionLogs: WorkoutSessionLog[], fromToday?: SetLog[]): SetLog[] {
  const count = parseSetCount(currentPrescription(exercise, week).workingSets);
  const lastSets = getLastExerciseLog(sessionLogs, exercise.name);
  return Array.from({ length: count }, (_, i) => fromToday?.[i] ?? (lastSets?.[i] ? { weightKg: lastSets[i].weightKg } : {}));
}

export default function SessionLog() {
  const { programId, dayId } = useLocalSearchParams<{ programId: string; dayId: string }>();
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const upsertSessionLog = useStore((s) => s.upsertSessionLog);
  const weightUnit = useStore((s) => s.profile.weightUnit);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const week = program?.currentWeek ?? 1;
  const today = todayISODate();

  const existingLog = sessionLogs.find((l) => l.programId === programId && l.dayId === dayId && l.date === today);

  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetLog[]>>(() => {
    const init: Record<string, SetLog[]> = {};
    day?.exercises.forEach((exercise) => {
      const fromToday = existingLog?.exerciseLogs.find((e) => e.exerciseId === exercise.id && e.exerciseName === exercise.name)?.sets;
      init[exercise.id] = initialSets(exercise, week, sessionLogs, fromToday);
    });
    return init;
  });

  // When an exercise is swapped from inside the log, its old entries no longer apply.
  const namesRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!day) return;
    const changed = day.exercises.filter((e) => namesRef.current[e.id] && namesRef.current[e.id] !== e.name);
    day.exercises.forEach((e) => { namesRef.current[e.id] = e.name; });
    if (changed.length === 0) return;
    setSetsByExercise((prev) => {
      const next = { ...prev };
      changed.forEach((e) => { next[e.id] = initialSets(e, week, sessionLogs); });
      return next;
    });
  }, [day, week, sessionLogs]);

  const updateSet = (exerciseId: string, index: number, field: 'weightKg' | 'reps', text: string) => {
    const n = parseFloat(text);
    const value = Number.isFinite(n) ? (field === 'weightKg' ? displayValueToKg(n, weightUnit) : n) : undefined;
    setSetsByExercise((prev) => {
      const sets = [...(prev[exerciseId] ?? [])];
      sets[index] = { ...sets[index], [field]: value };
      return { ...prev, [exerciseId]: sets };
    });
  };

  const onSave = () => {
    if (!program || !day || !programId || !dayId) return;
    upsertSessionLog({
      id: existingLog?.id,
      date: today,
      programId,
      dayId,
      dayName: day.name,
      exerciseLogs: day.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: setsByExercise[exercise.id] ?? [],
      })),
    });
    router.back();
  };

  if (!day) return null;

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title={day.name} />
        <Text style={styles.dateLabel}>{formatLongDate(today)}</Text>

        {day.exercises.map((exercise) => {
          const prescription = currentPrescription(exercise, week);
          const topSet = getLastTopSet(sessionLogs, exercise.name);
          const sets = setsByExercise[exercise.id] ?? [];
          return (
            <Card key={exercise.id} style={{ marginBottom: 14 }}>
              <View style={styles.titleRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Pressable
                  hitSlop={10}
                  onPress={() => router.push({ pathname: '/modals/exercise-swap', params: { programId, dayId, exerciseId: exercise.id } })}
                >
                  <Text style={styles.swapLink}>Swap</Text>
                </Pressable>
              </View>
              <View style={styles.badgeRow}>
                {exercise.muscleGroups.map((m) => (
                  <Badge key={m} label={m} color={getMuscleColor(m)} />
                ))}
              </View>
              <Text style={styles.targetText}>
                Target: {prescription.workingSets} × {prescription.reps} reps
              </Text>
              {topSet && <Text style={styles.lastText}>Last best: {formatSet(topSet, weightUnit)}</Text>}

              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderLabel, { flex: 1 }]}>Set</Text>
                <Text style={styles.setHeaderLabel}>Weight ({weightUnit})</Text>
                <Text style={styles.setHeaderLabel}>Reps</Text>
                <Text style={styles.setHeaderLabel}>RPE</Text>
              </View>
              {sets.map((set, i) => {
                const rpe = rpeForSet(prescription, i, sets.length);
                return (
                  <View key={i} style={styles.setRow}>
                    <Text style={[styles.setLabel, { flex: 1 }]}>{i + 1}</Text>
                    <TextInput
                      value={set.weightKg != null ? String(kgToDisplayValue(set.weightKg, weightUnit)) : ''}
                      onChangeText={(t) => updateSet(exercise.id, i, 'weightKg', t)}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      placeholderTextColor={colors.textFaint}
                      style={styles.setInput}
                    />
                    <TextInput
                      value={set.reps != null ? String(set.reps) : ''}
                      onChangeText={(t) => updateSet(exercise.id, i, 'reps', t)}
                      keyboardType="number-pad"
                      placeholder="—"
                      placeholderTextColor={colors.textFaint}
                      style={styles.setInput}
                    />
                    <Text style={styles.rpeLabel}>{rpe ? rpe.replace('~', '') : '—'}</Text>
                  </View>
                );
              })}
            </Card>
          );
        })}

        <Button label="Save Workout" onPress={onSave} style={{ marginTop: 8 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  dateLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: -8 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  exerciseName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
  swapLink: { color: colors.navyDeep, fontSize: 13, fontWeight: '600', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  targetText: { color: colors.textSecondary, fontSize: 12.5, marginTop: 6 },
  lastText: { color: colors.gold, fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6, gap: 10 },
  setHeaderLabel: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 90, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  setLabel: { color: colors.textSecondary, fontSize: 14 },
  rpeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', width: 90, textAlign: 'center' },
  setInput: {
    width: 90,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 8,
  },
});
