import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { LiftHistoryChart } from '@/components/LiftHistoryChart';
import { getFormCues } from '@/data/formCues';
import { DateField } from '@/components/DateField';
import { formatSet, getLastSlotLog, getLastSlotTopSet, getSlotExerciseHistory, parseSetCount } from '@/logic/sessionHistory';
import { formatShortDate, todayISODate } from '@/logic/dates';
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

/** Set rows for an exercise. When this slot was already logged on the selected date,
 * show exactly what was logged (every field, however many sets there really were) —
 * not a re-derived guess. Otherwise, blank rows sized to the current prescription, with
 * weight pre-filled from the last time this slot was logged (whatever exercise it was). */
function initialSets(exercise: Exercise, week: number, sessionLogs: WorkoutSessionLog[], dayId: string, fromToday?: SetLog[]): SetLog[] {
  if (fromToday) return fromToday.map((s) => ({ ...s }));
  const count = parseSetCount(currentPrescription(exercise, week).workingSets);
  const lastSets = getLastSlotLog(sessionLogs, dayId, exercise.id)?.sets;
  return Array.from({ length: count }, (_, i) => (lastSets?.[i] ? { weightKg: lastSets[i].weightKg } : {}));
}

export default function SessionLog() {
  const { programId, dayId, date: dateParam } = useLocalSearchParams<{ programId: string; dayId: string; date?: string }>();
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const upsertSessionLog = useStore((s) => s.upsertSessionLog);
  const weightUnit = useStore((s) => s.profile.weightUnit);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const week = program?.currentWeek ?? 1;

  // Builds every exercise's set rows for a given date — whatever was already logged
  // that day, if anything. Used both for the initial load and whenever the user picks
  // a different date, so switching dates is a plain event-driven update rather than an
  // effect syncing state after the fact.
  const buildSetsForDate = (targetDate: string): Record<string, SetLog[]> => {
    const init: Record<string, SetLog[]> = {};
    if (!day) return init;
    const logForDate = sessionLogs.find((l) => l.programId === programId && l.dayId === dayId && l.date === targetDate);
    day.exercises.forEach((exercise) => {
      const loggedEntry = logForDate?.exerciseLogs.find((e) => e.exerciseId === exercise.id);
      init[exercise.id] = initialSets(exercise, week, sessionLogs, dayId, loggedEntry?.sets);
    });
    return init;
  };

  const [date, setDate] = useState(dateParam ?? todayISODate());
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetLog[]>>(() => buildSetsForDate(dateParam ?? todayISODate()));

  const existingLog = sessionLogs.find((l) => l.programId === programId && l.dayId === dayId && l.date === date);

  const onDateChange = (newDate: string) => {
    setDate(newDate);
    setSetsByExercise(buildSetsForDate(newDate));
  };

  // When an exercise is swapped from inside the log, its old entries no longer apply.
  const namesRef = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!day) return;
    const changed = day.exercises.filter((e) => namesRef.current[e.id] && namesRef.current[e.id] !== e.name);
    day.exercises.forEach((e) => { namesRef.current[e.id] = e.name; });
    if (changed.length === 0) return;
    setSetsByExercise((prev) => {
      const next = { ...prev };
      changed.forEach((e) => { next[e.id] = initialSets(e, week, sessionLogs, dayId); });
      return next;
    });
  }, [day, week, sessionLogs]);

  const updateSet = (exerciseId: string, index: number, field: 'weightKg' | 'reps' | 'partialReps', text: string) => {
    const n = parseFloat(text);
    const value = Number.isFinite(n) ? (field === 'weightKg' ? displayValueToKg(n, weightUnit) : n) : undefined;
    setSetsByExercise((prev) => {
      const sets = [...(prev[exerciseId] ?? [])];
      sets[index] = { ...sets[index], [field]: value };
      return { ...prev, [exerciseId]: sets };
    });
  };

  // The exercise actually logged for this slot on the selected date, if it differs from
  // today's default (e.g. a past substitution) — kept so re-saving a past log doesn't
  // silently rename it back to whatever's currently the default for that slot.
  const loggedNameFor = (exerciseId: string): string | undefined =>
    existingLog?.exerciseLogs.find((e) => e.exerciseId === exerciseId)?.exerciseName;

  // What to call this slot: exactly what was logged on the selected date if anything, else
  // whatever was last actually done here (a real substitution can be a long-running habit,
  // not a one-off), else finally the program's own default name for the slot.
  const effectiveName = (exercise: Exercise): string =>
    loggedNameFor(exercise.id) ?? getLastSlotLog(sessionLogs, dayId, exercise.id)?.exerciseName ?? exercise.name;

  const onSave = () => {
    if (!program || !day || !programId || !dayId) return;
    upsertSessionLog({
      id: existingLog?.id,
      date,
      programId,
      dayId,
      dayName: day.name,
      exerciseLogs: day.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        exerciseName: effectiveName(exercise),
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
        <DateField dateISO={date} onChange={onDateChange} />

        {day.exercises.map((exercise) => {
          const prescription = currentPrescription(exercise, week);
          const displayName = effectiveName(exercise);
          const lastSlotLog = getLastSlotLog(sessionLogs, dayId, exercise.id);
          const topSet = getLastSlotTopSet(sessionLogs, dayId, exercise.id);
          const sets = setsByExercise[exercise.id] ?? [];
          const cues = getFormCues(displayName);
          return (
            <Card key={exercise.id} style={{ marginBottom: 14 }}>
              <View style={styles.titleRow}>
                <Text style={styles.exerciseName}>{displayName}</Text>
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
              {topSet && (
                <Text style={styles.lastText}>
                  Last best: {formatSet(topSet, weightUnit)}
                  {lastSlotLog && lastSlotLog.exerciseName !== displayName ? ` (as ${lastSlotLog.exerciseName})` : ''}
                </Text>
              )}
              {cues && (
                <View style={styles.cuesBox}>
                  {cues.map((c, i) => (
                    <Text key={i} style={styles.cueText}>
                      · {c}
                    </Text>
                  ))}
                </View>
              )}
              <LiftHistoryChart
                points={getSlotExerciseHistory(sessionLogs, dayId, exercise.id)}
                weightUnit={weightUnit}
                onPointPress={(p) =>
                  Alert.alert(formatShortDate(p.date), formatSet(p.topSet, weightUnit), [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Go to This Date', onPress: () => onDateChange(p.date) },
                  ])
                }
              />

              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderLabel, { flex: 1 }]}>Set</Text>
                <Text style={styles.setHeaderLabel}>Weight ({weightUnit})</Text>
                <Text style={styles.setHeaderLabel}>Reps</Text>
                <Text style={styles.setHeaderLabelNarrow}>+Partial</Text>
                <Text style={styles.setHeaderLabelNarrow}>RPE</Text>
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
                    <TextInput
                      value={set.partialReps != null ? String(set.partialReps) : ''}
                      onChangeText={(t) => updateSet(exercise.id, i, 'partialReps', t)}
                      keyboardType="number-pad"
                      placeholder="—"
                      placeholderTextColor={colors.textFaint}
                      style={styles.setInputNarrow}
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  exerciseName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
  swapLink: { color: colors.navyDeep, fontSize: 13, fontWeight: '600', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  targetText: { color: colors.textSecondary, fontSize: 12.5, marginTop: 6 },
  lastText: { color: colors.gold, fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  cuesBox: { marginTop: 8, backgroundColor: colors.bgAlt, borderRadius: 2, padding: 10 },
  cueText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6, gap: 6 },
  setHeaderLabel: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 74, textAlign: 'center' },
  setHeaderLabelNarrow: { color: colors.textFaint, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, width: 50, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  setLabel: { color: colors.textSecondary, fontSize: 14 },
  rpeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', width: 50, textAlign: 'center' },
  setInput: {
    width: 74,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 8,
  },
  setInputNarrow: {
    width: 50,
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
