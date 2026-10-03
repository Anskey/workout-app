import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, Pill } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { LiftHistoryChart } from '@/components/LiftHistoryChart';
import { getFormCues } from '@/data/formCues';
import { DateField } from '@/components/DateField';
import {
  formatSet,
  getEffectiveWeekForDay,
  getLastSlotLog,
  getLastSlotLogForName,
  getLastSlotTopSet,
  getSlotExerciseHistory,
  parseSetCount,
} from '@/logic/sessionHistory';
import { todayISODate } from '@/logic/dates';
import { getExerciseNote } from '@/logic/exerciseNotes';
import { displayValueToKg, kgToDisplayValue } from '@/logic/units';
import { DATE_WINDOWS, filterByWindow, type DateWindow } from '@/logic/dateWindows';
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
 * only the first set's weight pre-filled from last time THIS EXACT exercise (by name) was
 * done here — a substitution can load very differently, so the weight only carries over
 * when it's really the same movement. Later sets are left blank either way, rather than
 * assuming every set stays at that same weight. */
function initialSets(
  exercise: Exercise,
  week: number,
  sessionLogs: WorkoutSessionLog[],
  dayId: string,
  name: string,
  fromToday?: SetLog[]
): SetLog[] {
  if (fromToday) return fromToday.map((s) => ({ ...s }));
  const count = parseSetCount(currentPrescription(exercise, week).workingSets);
  const lastFirstWeight = getLastSlotLogForName(sessionLogs, dayId, exercise.id, name)?.sets[0]?.weightKg;
  return Array.from({ length: count }, (_, i) => (i === 0 && lastFirstWeight != null ? { weightKg: lastFirstWeight } : {}));
}

export default function SessionLog() {
  const { programId, dayId, date: dateParam } = useLocalSearchParams<{ programId: string; dayId: string; date?: string }>();
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const upsertSessionLog = useStore((s) => s.upsertSessionLog);
  const weightUnit = useStore((s) => s.profile.weightUnit);
  const exerciseNotes = useStore((s) => s.exerciseNotes);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);

  // Builds every exercise's set rows for a given date — whatever was already logged
  // that day, if anything. Used both for the initial load and whenever the user picks
  // a different date, so switching dates is a plain event-driven update rather than an
  // effect syncing state after the fact. The week used is whichever this exact day was
  // actually due for as of that date (see getEffectiveWeekForDay), not a shared pointer.
  const buildSetsForDate = (targetDate: string): Record<string, SetLog[]> => {
    const init: Record<string, SetLog[]> = {};
    if (!day) return init;
    const weekForDate = getEffectiveWeekForDay(day, sessionLogs, programId, targetDate);
    const logForDate = sessionLogs.find((l) => l.programId === programId && l.dayId === dayId && l.date === targetDate);
    day.exercises.forEach((exercise) => {
      const loggedEntry = logForDate?.exerciseLogs.find((e) => e.exerciseId === exercise.id);
      const name = loggedEntry?.exerciseName ?? exercise.name;
      init[exercise.id] = initialSets(exercise, weekForDate, sessionLogs, dayId, name, loggedEntry?.sets);
    });
    return init;
  };

  const [date, setDate] = useState(dateParam ?? todayISODate());
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetLog[]>>(() => buildSetsForDate(dateParam ?? todayISODate()));
  const [historyWindow, setHistoryWindow] = useState<DateWindow>('all');

  const week = getEffectiveWeekForDay(day, sessionLogs, programId, date);

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
      changed.forEach((e) => { next[e.id] = initialSets(e, week, sessionLogs, dayId, e.name); });
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

  // What to call this slot: exactly what was logged on the selected date if anything,
  // else the program's own default name — a slot's own history can be a genuine mix of
  // the default and occasional substitutions, so the last-used name isn't a reliable
  // stand-in for "what this exercise really is." The "(as X)" note below the target
  // still surfaces the last substitution without letting it silently become the default.
  const effectiveName = (exercise: Exercise): string => loggedNameFor(exercise.id) ?? exercise.name;

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

        <Text style={styles.historyWindowLabel}>Progress chart range</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          <View style={styles.pillRow}>
            {DATE_WINDOWS.map((w) => (
              <Pill key={w.key} label={w.label} active={historyWindow === w.key} onPress={() => setHistoryWindow(w.key)} />
            ))}
          </View>
        </ScrollView>

        {day.exercises.map((exercise) => {
          const prescription = currentPrescription(exercise, week);
          const displayName = effectiveName(exercise);
          const lastSlotLog = getLastSlotLog(sessionLogs, dayId, exercise.id);
          const topSet = getLastSlotTopSet(sessionLogs, dayId, exercise.id);
          const sets = setsByExercise[exercise.id] ?? [];
          const cues = getFormCues(displayName);
          const note = getExerciseNote(displayName, exerciseNotes);
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
              {!!note && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{note}</Text>
                </View>
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
                points={filterByWindow(getSlotExerciseHistory(sessionLogs, dayId, exercise.id), historyWindow)}
                weightUnit={weightUnit}
                onPointPress={(p) => onDateChange(p.date)}
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
  historyWindowLabel: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  pillRow: { flexDirection: 'row' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  exerciseName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 },
  swapLink: { color: colors.navyDeep, fontSize: 13, fontWeight: '600', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  targetText: { color: colors.textSecondary, fontSize: 12.5, marginTop: 6 },
  lastText: { color: colors.gold, fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  cuesBox: { marginTop: 8, backgroundColor: colors.bgAlt, borderRadius: 2, padding: 10 },
  cueText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  notesBox: { marginTop: 8, backgroundColor: colors.bgAlt, borderRadius: 2, padding: 10 },
  notesText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6, gap: 6 },
  setHeaderLabel: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 74, textAlign: 'center' },
  setHeaderLabelNarrow: { color: colors.textFaint, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, width: 50, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  setLabel: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  rpeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', width: 50, textAlign: 'center' },
  setInput: {
    width: 74,
    textAlign: 'center',
    textAlignVertical: 'center',
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
    textAlignVertical: 'center',
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 8,
  },
});
