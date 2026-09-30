import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ChevronRightIcon } from '@/components/Icons';
import { useActiveProgram } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';

export default function Exercises() {
  const program = useActiveProgram();
  const [query, setQuery] = useState('');

  const days = useMemo(() => {
    if (!program) return [];
    const q = query.trim().toLowerCase();
    if (!q) return program.days;
    return program.days
      .map((day) => ({ ...day, exercises: day.exercises.filter((e) => e.name.toLowerCase().includes(q)) }))
      .filter((day) => day.exercises.length > 0);
  }, [program, query]);

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No program yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle subtitle="Every exercise in your program — tap one to view or edit it.">Exercises</ScreenTitle>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises…"
          placeholderTextColor={colors.textFaint}
          style={styles.search}
        />

        {days.length === 0 ? (
          <Text style={styles.emptyText}>No exercises match &ldquo;{query}&rdquo;.</Text>
        ) : (
          days.map((day) => (
            <View key={day.id} style={{ marginBottom: 18 }}>
              <SectionHeader>{day.name}</SectionHeader>
              <Card padded={false}>
                {day.exercises.map((exercise, i) => (
                  <Pressable
                    key={exercise.id}
                    onPress={() =>
                      router.push({
                        pathname: '/modals/exercise-editor',
                        params: { programId: program.id, dayId: day.id, exerciseId: exercise.id },
                      })
                    }
                    style={[styles.row, i !== day.exercises.length - 1 && styles.rowBorder]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseMeta}>
                        {exercise.workingSets} sets × {exercise.reps} reps
                      </Text>
                      <View style={styles.badgeRow}>
                        {exercise.muscleGroups.map((m) => (
                          <Badge key={m} label={m} color={getMuscleColor(m)} />
                        ))}
                      </View>
                    </View>
                    <ChevronRightIcon color={colors.textFaint} />
                  </Pressable>
                ))}
              </Card>
            </View>
          ))
        )}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 140 },
  search: {
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});
