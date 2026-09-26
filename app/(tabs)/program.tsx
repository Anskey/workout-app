import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, ScreenTitle, serif } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { ChevronRightIcon, PlusIcon } from '@/components/Icons';
import { useActiveProgram, useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import type { Exercise, WorkoutDay } from '@/types';

export default function Program() {
  const program = useActiveProgram();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No program yet.</Text>
          <Button label="Create a Program" onPress={() => router.push('/modals/new-program')} style={{ marginTop: 16 }} />
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
          <GlassCard style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} padded>
            <Text style={styles.programName}>{program.name}</Text>
            <ChevronRightIcon color={colors.textFaint} />
          </GlassCard>
        </Pressable>

        {program.days.map((day) => (
          <DayCard key={day.id} day={day} programId={program.id} expanded={!!expanded[day.id]} onToggle={() => toggle(day.id)} />
        ))}

        <Button
          label="Add Workout Day"
          variant="glass"
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
  expanded,
  onToggle,
}: {
  day: WorkoutDay;
  programId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard style={styles.dayCard}>
      <Pressable onPress={onToggle} style={styles.dayHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayName}>{day.name}</Text>
          <Text style={styles.dayMeta}>{day.exercises.length} exercises</Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={() => router.push({ pathname: '/modals/day-editor', params: { programId, dayId: day.id } })}
        >
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      </Pressable>

      {expanded && (
        <View style={styles.exerciseList}>
          {day.exercises.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} programId={programId} dayId={day.id} />
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
    </GlassCard>
  );
}

function ExerciseRow({ exercise, programId, dayId }: { exercise: Exercise; programId: string; dayId: string }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/modals/exercise-editor', params: { programId, dayId, exerciseId: exercise.id } })}
      style={styles.exerciseRow}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.workingSets} sets × {exercise.reps} reps
          {exercise.rest ? ` · rest ${exercise.rest}` : ''}
        </Text>
        <View style={styles.badgeRow}>
          {exercise.muscleGroups.map((m) => (
            <Badge key={m} label={m} color={getMuscleColor(m)} />
          ))}
        </View>
      </View>
      <ChevronRightIcon color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 140 },
  headerRow: { marginBottom: 2 },
  programName: { fontFamily: serif, fontSize: 18, color: colors.textPrimary },
  dayCard: { marginBottom: 14, padding: 16 },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  dayName: { fontFamily: serif, fontSize: 19, color: colors.textPrimary },
  dayMeta: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  editLink: { color: colors.gold, fontSize: 13, fontWeight: '600' },
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
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  addExerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'center', gap: 6 },
  addExerciseText: { color: colors.gold, fontSize: 13.5, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
});
