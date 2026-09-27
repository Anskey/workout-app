import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, Pill, ScreenTitle, SectionHeader, serif } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ChevronRightIcon, PlusIcon } from '@/components/Icons';
import { useActiveProgram, useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { formatSets, getLastExerciseLog } from '@/logic/sessionHistory';
import { DEFAULT_PROGRAM_ID } from '@/data/seedProgram';
import type { Exercise, WeekPrescription, WorkoutDay, WorkoutSessionLog } from '@/types';

function currentPrescription(exercise: Exercise, week: number): WeekPrescription | Exercise {
  return exercise.weeklyProgression?.find((w) => w.week === week) ?? exercise;
}

export default function Program() {
  const program = useActiveProgram();
  const setProgramWeek = useStore((s) => s.setProgramWeek);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const blocks = useMemo(() => {
    if (!program) return [];
    const set = new Set<number>();
    program.days.forEach((d) => { if (d.block != null) set.add(d.block); });
    return Array.from(set).sort((a, b) => a - b);
  }, [program]);

  const selectedBlock = program?.currentBlock ?? blocks[0];
  const daysInBlock = program ? program.days.filter((d) => (blocks.length === 0 ? true : d.block === selectedBlock)) : [];
  const blockLabel = daysInBlock[0]?.blockLabel;

  const maxWeek = useMemo(() => {
    let max = 0;
    daysInBlock.forEach((d) => d.exercises.forEach((e) => e.weeklyProgression?.forEach((w) => { if (w.week > max) max = w.week; })));
    return max;
  }, [daysInBlock]);

  const currentWeek = program?.currentWeek ?? 1;

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No program yet.</Text>
          <Button label="Create a Program" onPress={() => router.push('/modals/program-picker')} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <ScreenTitle subtitle={`${program.days.length} workout days`}>Program</ScreenTitle>
        </View>

        <Pressable onPress={() => router.push('/modals/program-picker')} style={{ marginBottom: 18 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} padded>
            <Text style={styles.programName}>{program.name}</Text>
            <ChevronRightIcon color={colors.textFaint} />
          </Card>
        </Pressable>

        {blocks.length > 1 && (
          <View style={{ marginBottom: 6 }}>
            <SectionHeader>Block</SectionHeader>
            <View style={styles.pillRow}>
              {blocks.map((b) => (
                <Pill
                  key={b}
                  label={`Block ${b}`}
                  active={selectedBlock === b}
                  onPress={() => setProgramWeek(program.id, b, 1)}
                />
              ))}
            </View>
          </View>
        )}

        {blockLabel && <Text style={styles.blockLabel}>{blockLabel}</Text>}

        {maxWeek > 1 && (
          <View style={{ marginBottom: 18 }}>
            <SectionHeader>Week</SectionHeader>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.pillRow}>
                {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
                  <Pill key={w} label={`Week ${w}`} active={currentWeek === w} onPress={() => setProgramWeek(program.id, selectedBlock ?? 1, w)} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {daysInBlock.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            programId={program.id}
            currentWeek={currentWeek}
            expanded={!!expanded[day.id]}
            onToggle={() => toggle(day.id)}
            sessionLogs={sessionLogs}
          />
        ))}

        <Button
          label="Add Workout Day"
          variant="outline"
          onPress={() => router.push({ pathname: '/modals/day-editor', params: { programId: program.id } })}
          style={{ marginTop: 6 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DayCard({
  day,
  programId,
  currentWeek,
  expanded,
  onToggle,
  sessionLogs,
}: {
  day: WorkoutDay;
  programId: string;
  currentWeek: number;
  expanded: boolean;
  onToggle: () => void;
  sessionLogs: WorkoutSessionLog[];
}) {
  const resetDayToDefault = useStore((s) => s.resetDayToDefault);
  const isDefaultProgram = programId === DEFAULT_PROGRAM_ID;

  const onResetDay = () => {
    Alert.alert('Reset day to default?', `"${day.name}" will revert to the program's original exercises, undoing any edits or swaps.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetDayToDefault(programId, day.id) },
    ]);
  };

  return (
    <Card style={styles.dayCard}>
      <Pressable onPress={onToggle} style={styles.dayHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayName}>{day.name}</Text>
          <Text style={styles.dayMeta}>{day.exercises.length} exercises</Text>
        </View>
        <View style={styles.headerLinks}>
          {isDefaultProgram && (
            <Pressable hitSlop={10} onPress={onResetDay}>
              <Text style={styles.resetLink}>Reset</Text>
            </Pressable>
          )}
          <Pressable
            hitSlop={10}
            onPress={() => router.push({ pathname: '/modals/day-editor', params: { programId, dayId: day.id } })}
          >
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.exerciseList}>
          <Button
            label="Log This Workout"
            onPress={() => router.push({ pathname: '/modals/session-log', params: { programId, dayId: day.id } })}
            style={{ marginBottom: 14 }}
          />
          {day.exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              programId={programId}
              dayId={day.id}
              currentWeek={currentWeek}
              lastSetsText={formatSets(getLastExerciseLog(sessionLogs, exercise.name))}
            />
          ))}
          <Pressable
            style={styles.addExerciseRow}
            onPress={() => router.push({ pathname: '/modals/exercise-editor', params: { programId, dayId: day.id } })}
          >
            <PlusIcon color={colors.gold} size={15} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function ExerciseRow({
  exercise,
  programId,
  dayId,
  currentWeek,
  lastSetsText,
}: {
  exercise: Exercise;
  programId: string;
  dayId: string;
  currentWeek: number;
  lastSetsText: string;
}) {
  const prescription = currentPrescription(exercise, currentWeek);
  const resetExerciseToDefault = useStore((s) => s.resetExerciseToDefault);
  const isDefaultProgram = programId === DEFAULT_PROGRAM_ID;

  const onReset = () => {
    Alert.alert('Reset exercise to default?', `"${exercise.name}" will revert to what the program originally prescribed here.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetExerciseToDefault(programId, dayId, exercise.id) },
    ]);
  };

  return (
    <View style={styles.exerciseRow}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => router.push({ pathname: '/modals/exercise-editor', params: { programId, dayId, exerciseId: exercise.id } })}
      >
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {prescription.workingSets} sets × {prescription.reps} reps
          {prescription.rest ? ` · rest ${prescription.rest}` : ''}
        </Text>
        {!!lastSetsText && <Text style={styles.lastText}>Last: {lastSetsText}</Text>}
        <View style={styles.badgeRow}>
          {exercise.muscleGroups.map((m) => (
            <Badge key={m} label={m} color={getMuscleColor(m)} />
          ))}
        </View>
      </Pressable>
      <View style={styles.rowActions}>
        <Pressable
          hitSlop={10}
          onPress={() => router.push({ pathname: '/modals/exercise-swap', params: { programId, dayId, exerciseId: exercise.id } })}
        >
          <Text style={styles.swapLink}>Swap</Text>
        </Pressable>
        {isDefaultProgram && (
          <Pressable hitSlop={10} onPress={onReset}>
            <Text style={styles.resetLink}>Reset</Text>
          </Pressable>
        )}
        <ChevronRightIcon color={colors.textFaint} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 140 },
  headerRow: { marginBottom: 2 },
  programName: { fontFamily: serif, fontSize: 18, color: colors.textPrimary },
  blockLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 14, marginTop: -8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCard: { marginBottom: 14, padding: 16 },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  dayName: { fontFamily: serif, fontSize: 19, color: colors.textPrimary },
  dayMeta: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  editLink: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  headerLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  resetLink: { color: colors.textFaint, fontSize: 13, fontWeight: '600' },
  exerciseList: { marginTop: 14 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3 },
  lastText: { color: colors.gold, fontSize: 12, marginTop: 3, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  rowActions: { alignItems: 'flex-end', gap: 10, paddingLeft: 8 },
  swapLink: { color: colors.navyDeep, fontSize: 12.5, fontWeight: '600' },
  addExerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'center', gap: 6 },
  addExerciseText: { color: colors.gold, fontSize: 13.5, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
});
