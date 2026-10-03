import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { Badge, Button, Pill, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { ChevronRightIcon } from '@/components/Icons';
import { generateId, useStore } from '@/store/useStore';
import { ALL_MUSCLE_GROUPS, getMuscleColor } from '@/data/muscleGroups';
import type { MuscleGroup, WeekPrescription } from '@/types';

/** The program's view of an exercise slot: which exercise it is (read-only here — an exercise's
 * details live in the Exercises library) and how this program prescribes it (sets, reps, RPE,
 * rest). Name and muscle groups are only editable when creating a brand-new exercise. */
export default function ExerciseEditor() {
  const { programId, dayId, exerciseId } = useLocalSearchParams<{ programId: string; dayId: string; exerciseId?: string }>();
  const programs = useStore((s) => s.programs);
  const upsertExercise = useStore((s) => s.upsertExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const existing = useMemo(() => day?.exercises.find((e) => e.id === exerciseId), [day, exerciseId]);

  const currentWeek = program?.currentWeek ?? 1;
  const hasWeeklyProgression = !!existing?.weeklyProgression?.length;
  const weekEntry = existing?.weeklyProgression?.find((w) => w.week === currentWeek);
  const source = weekEntry ?? existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [muscles, setMuscles] = useState<MuscleGroup[]>(existing?.muscleGroups ?? []);
  const [warmupSets, setWarmupSets] = useState(source?.warmupSets ?? '');
  const [workingSets, setWorkingSets] = useState(source?.workingSets ?? '');
  const [reps, setReps] = useState(source?.reps ?? '');
  const [earlyRPE, setEarlyRPE] = useState(source?.earlyRPE ?? '');
  const [lastRPE, setLastRPE] = useState(source?.lastRPE ?? '');
  const [rest, setRest] = useState(source?.rest ?? '');

  const toggleMuscle = (m: MuscleGroup) =>
    setMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const onSave = () => {
    if (!name.trim() || !programId || !dayId) return;

    const prescription = {
      warmupSets: warmupSets.trim() || undefined,
      workingSets: workingSets.trim() || '2',
      reps: reps.trim() || '8-12',
      earlyRPE: earlyRPE.trim() || undefined,
      lastRPE: lastRPE.trim() || undefined,
      rest: rest.trim() || undefined,
    };

    let weeklyProgression: WeekPrescription[] | undefined = existing?.weeklyProgression;
    if (hasWeeklyProgression) {
      const already = weeklyProgression!.some((w) => w.week === currentWeek);
      weeklyProgression = already
        ? weeklyProgression!.map((w) => (w.week === currentWeek ? { week: currentWeek, ...prescription } : w))
        : [...weeklyProgression!, { week: currentWeek, ...prescription }].sort((a, b) => a.week - b.week);
    }

    upsertExercise(programId, dayId, {
      id: existing?.id ?? generateId(),
      name: name.trim(),
      muscleGroups: muscles,
      ...(hasWeeklyProgression ? { warmupSets: existing?.warmupSets, workingSets: existing?.workingSets ?? '2', reps: existing?.reps ?? '8-12', earlyRPE: existing?.earlyRPE, lastRPE: existing?.lastRPE, rest: existing?.rest } : prescription),
      substitutions: existing?.substitutions ?? [],
      isWeakPointSlot: existing?.isWeakPointSlot,
      weeklyProgression,
    });
    router.back();
  };

  const onDelete = () => {
    if (!existing || !programId || !dayId) return;
    Alert.alert('Remove from this day?', `"${existing.name}" will be removed from ${day?.name ?? 'this day'}. The exercise itself stays in your library.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { deleteExercise(programId, dayId, existing.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title={existing ? 'Prescription' : 'Add Exercise'} />
        {day && (
          <Text style={styles.context}>
            {day.name} · {program?.name}
          </Text>
        )}

        {existing ? (
          <Card style={{ marginBottom: 16 }} padded={false}>
            <Pressable
              onPress={() => router.push({ pathname: '/modals/exercise-detail', params: { name: existing.name } })}
              style={styles.exerciseRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{existing.name}</Text>
                <View style={styles.badgeRow}>
                  {existing.muscleGroups.map((m) => (
                    <Badge key={m} label={m} color={getMuscleColor(m)} />
                  ))}
                </View>
                <Text style={styles.exerciseHint}>View exercise details, notes and history</Text>
              </View>
              <ChevronRightIcon color={colors.textFaint} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              onPress={() => router.push({ pathname: '/modals/exercise-swap', params: { programId, dayId, exerciseId: existing.id } })}
              style={styles.swapRow}
            >
              <Text style={styles.swapText}>Swap for a different exercise</Text>
              <ChevronRightIcon color={colors.textFaint} />
            </Pressable>
          </Card>
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <SectionHeader>Name</SectionHeader>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Standing Calf Raise"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />

            <SectionHeader>Muscle Groups</SectionHeader>
            <View style={styles.pillWrap}>
              {ALL_MUSCLE_GROUPS.map((m) => (
                <Pill key={m} label={m} active={muscles.includes(m)} onPress={() => toggleMuscle(m)} />
              ))}
            </View>
          </Card>
        )}

        <Card>
          <SectionHeader>{hasWeeklyProgression ? `This program — Week ${currentWeek}` : 'This program'}</SectionHeader>
          <Text style={styles.weekHint}>
            {hasWeeklyProgression
              ? `Sets, reps and effort for this exercise in ${program?.name ?? 'this program'}. You’re editing Week ${currentWeek} of ${day?.blockLabel ?? 'this block'} — switch weeks from the Program tab to edit a different one.`
              : `Sets, reps and effort for this exercise in ${program?.name ?? 'this program'}. A different program can prescribe it differently.`}
          </Text>
          <MeasurementField label="Warm-up Sets" unit="" value={warmupSets} onChangeText={setWarmupSets} placeholder="1-2" />
          <MeasurementField label="Working Sets" unit="" value={workingSets} onChangeText={setWorkingSets} placeholder="2" />
          <MeasurementField label="Reps" unit="" value={reps} onChangeText={setReps} placeholder="8-12" />
          <MeasurementField label="Early Set RPE" unit="" value={earlyRPE} onChangeText={setEarlyRPE} placeholder="~7" />
          <MeasurementField label="Last Set RPE" unit="" value={lastRPE} onChangeText={setLastRPE} placeholder="~9" />
          <MeasurementField label="Rest" unit="" value={rest} onChangeText={setRest} placeholder="~2 min" />
        </Card>

        <Button label="Save" onPress={onSave} disabled={!name.trim()} style={{ marginTop: 20 }} />
        {existing && <Button label="Remove From This Day" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  context: { color: colors.textFaint, fontSize: 12.5, marginTop: -10, marginBottom: 16 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  exerciseName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  exerciseHint: { color: colors.gold, fontSize: 12.5, fontWeight: '600', marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginHorizontal: 18 },
  swapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, minHeight: 48 },
  swapText: { color: colors.navyDeep, fontSize: 14.5, fontWeight: '600' },
  weekHint: { color: colors.textFaint, fontSize: 12.5, lineHeight: 18, marginBottom: 10 },
});
