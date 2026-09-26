import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, Pill, SectionHeader } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { generateId, useStore } from '@/store/useStore';
import type { MuscleGroup } from '@/types';

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back Width', 'Back Thickness', 'Shoulders', 'Rear Delts', 'Biceps', 'Triceps', 'Forearms',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abs', 'Neck', 'Traps',
];

export default function ExerciseEditor() {
  const { programId, dayId, exerciseId } = useLocalSearchParams<{ programId: string; dayId: string; exerciseId?: string }>();
  const programs = useStore((s) => s.programs);
  const upsertExercise = useStore((s) => s.upsertExercise);
  const deleteExercise = useStore((s) => s.deleteExercise);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const existing = useMemo(() => day?.exercises.find((e) => e.id === exerciseId), [day, exerciseId]);

  const [name, setName] = useState(existing?.name ?? '');
  const [muscles, setMuscles] = useState<MuscleGroup[]>(existing?.muscleGroups ?? []);
  const [warmupSets, setWarmupSets] = useState(existing?.warmupSets ?? '');
  const [workingSets, setWorkingSets] = useState(existing?.workingSets ?? '');
  const [reps, setReps] = useState(existing?.reps ?? '');
  const [earlyRPE, setEarlyRPE] = useState(existing?.earlyRPE ?? '');
  const [lastRPE, setLastRPE] = useState(existing?.lastRPE ?? '');
  const [rest, setRest] = useState(existing?.rest ?? '');
  const [substitutions, setSubstitutions] = useState(existing?.substitutions?.join(', ') ?? '');

  const toggleMuscle = (m: MuscleGroup) =>
    setMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const onSave = () => {
    if (!name.trim() || !programId || !dayId) return;
    upsertExercise(programId, dayId, {
      id: existing?.id ?? generateId(),
      name: name.trim(),
      muscleGroups: muscles,
      warmupSets: warmupSets.trim() || undefined,
      workingSets: workingSets.trim() || '2',
      reps: reps.trim() || '8-12',
      earlyRPE: earlyRPE.trim() || undefined,
      lastRPE: lastRPE.trim() || undefined,
      rest: rest.trim() || undefined,
      substitutions: substitutions.split(',').map((s) => s.trim()).filter(Boolean),
      isWeakPointSlot: existing?.isWeakPointSlot,
    });
    router.back();
  };

  const onDelete = () => {
    if (!existing || !programId || !dayId) return;
    Alert.alert('Delete exercise?', `"${existing.name}" will be removed from this day.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteExercise(programId, dayId, existing.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ModalHeader title={existing ? 'Edit Exercise' : 'New Exercise'} />

          <GlassCard style={{ marginBottom: 16 }}>
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
          </GlassCard>

          <GlassCard style={{ marginBottom: 16 }}>
            <SectionHeader>Prescription</SectionHeader>
            <MeasurementField label="Warm-up Sets" unit="" value={warmupSets} onChangeText={setWarmupSets} placeholder="1-2" />
            <MeasurementField label="Working Sets" unit="" value={workingSets} onChangeText={setWorkingSets} placeholder="2" />
            <MeasurementField label="Reps" unit="" value={reps} onChangeText={setReps} placeholder="8-12" />
            <MeasurementField label="Early Set RPE" unit="" value={earlyRPE} onChangeText={setEarlyRPE} placeholder="~7" />
            <MeasurementField label="Last Set RPE" unit="" value={lastRPE} onChangeText={setLastRPE} placeholder="~9" />
            <MeasurementField label="Rest" unit="" value={rest} onChangeText={setRest} placeholder="~2 min" />
          </GlassCard>

          <GlassCard>
            <SectionHeader>Substitutions (comma separated)</SectionHeader>
            <TextInput
              value={substitutions}
              onChangeText={setSubstitutions}
              placeholder="Machine Pulldown, Cable Pullover"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              multiline
            />
          </GlassCard>

          <Button label="Save" onPress={onSave} disabled={!name.trim()} style={{ marginTop: 20 }} />
          {existing && <Button label="Delete Exercise" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.glassFill,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
