import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { formatSets, getLastExerciseLog, parseSetCount } from '@/logic/sessionHistory';
import { formatLongDate, todayISODate } from '@/logic/dates';
import type { Exercise, SetLog, WeekPrescription } from '@/types';

function currentPrescription(exercise: Exercise, week: number): WeekPrescription | Exercise {
  return exercise.weeklyProgression?.find((w) => w.week === week) ?? exercise;
}

export default function SessionLog() {
  const { programId, dayId } = useLocalSearchParams<{ programId: string; dayId: string }>();
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const upsertSessionLog = useStore((s) => s.upsertSessionLog);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const week = program?.currentWeek ?? 1;
  const today = todayISODate();

  const existingLog = sessionLogs.find((l) => l.programId === programId && l.dayId === dayId && l.date === today);

  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetLog[]>>(() => {
    const init: Record<string, SetLog[]> = {};
    day?.exercises.forEach((exercise) => {
      const prescription = currentPrescription(exercise, week);
      const count = parseSetCount(prescription.workingSets);
      const fromToday = existingLog?.exerciseLogs.find((e) => e.exerciseId === exercise.id)?.sets;
      const lastSets = getLastExerciseLog(sessionLogs, exercise.name);
      const sets: SetLog[] = [];
      for (let i = 0; i < count; i++) {
        if (fromToday?.[i]) sets.push(fromToday[i]);
        else if (lastSets?.[i]) sets.push({ weightKg: lastSets[i].weightKg, reps: undefined });
        else sets.push({});
      }
      init[exercise.id] = sets;
    });
    return init;
  });

  const updateSet = (exerciseId: string, index: number, field: 'weightKg' | 'reps', text: string) => {
    const n = parseFloat(text);
    setSetsByExercise((prev) => {
      const sets = [...(prev[exerciseId] ?? [])];
      sets[index] = { ...sets[index], [field]: Number.isFinite(n) ? n : undefined };
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ModalHeader title={day.name} />
          <Text style={styles.dateLabel}>{formatLongDate(today)}</Text>

          {day.exercises.map((exercise) => {
            const prescription = currentPrescription(exercise, week);
            const lastSets = getLastExerciseLog(sessionLogs, exercise.name);
            const sets = setsByExercise[exercise.id] ?? [];
            return (
              <Card key={exercise.id} style={{ marginBottom: 14 }}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.badgeRow}>
                  {exercise.muscleGroups.map((m) => (
                    <Badge key={m} label={m} color={getMuscleColor(m)} />
                  ))}
                </View>
                <Text style={styles.targetText}>
                  Target: {prescription.workingSets} × {prescription.reps} reps
                  {prescription.lastRPE ? ` @ RPE ${prescription.lastRPE.replace('~', '')}` : ''}
                </Text>
                {lastSets && <Text style={styles.lastText}>Last time: {formatSets(lastSets)}</Text>}

                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setHeaderLabel, { flex: 1 }]}>Set</Text>
                  <Text style={styles.setHeaderLabel}>Weight (kg)</Text>
                  <Text style={styles.setHeaderLabel}>Reps</Text>
                </View>
                {sets.map((set, i) => (
                  <View key={i} style={styles.setRow}>
                    <Text style={[styles.setLabel, { flex: 1 }]}>{i + 1}</Text>
                    <TextInput
                      value={set.weightKg != null ? String(set.weightKg) : ''}
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
                  </View>
                ))}
              </Card>
            );
          })}

          <Button label="Save Workout" onPress={onSave} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  dateLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: -8 },
  exerciseName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  targetText: { color: colors.textSecondary, fontSize: 12.5, marginTop: 6 },
  lastText: { color: colors.gold, fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 6, gap: 10 },
  setHeaderLabel: { color: colors.textFaint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, width: 90, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  setLabel: { color: colors.textSecondary, fontSize: 14 },
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
