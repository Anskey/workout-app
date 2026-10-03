import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { Badge, Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ProfileButton } from '@/components/ProfileButton';
import { ChevronRightIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';
import { ALL_MUSCLE_GROUPS, getMuscleColor } from '@/data/muscleGroups';
import { buildExerciseLibrary, type LibraryExercise } from '@/data/exerciseLibrary';
import { countLoggedSessionsByName } from '@/logic/sessionHistory';
import type { MuscleGroup } from '@/types';

const OTHER = 'Other';

export default function Exercises() {
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const [query, setQuery] = useState('');

  // One catalog of every exercise the app knows about, across all programs — not tied to
  // any one program's days or prescriptions — grouped by its primary muscle group.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const library = buildExerciseLibrary(programs, sessionLogs).filter((e) => !q || e.name.toLowerCase().includes(q));
    const byGroup = new Map<string, LibraryExercise[]>();
    library.forEach((e) => {
      const key = e.muscleGroups[0] ?? OTHER;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(e);
    });
    const order: string[] = [...ALL_MUSCLE_GROUPS, OTHER];
    return order.filter((g) => byGroup.has(g)).map((g) => ({ group: g, exercises: byGroup.get(g)! }));
  }, [programs, sessionLogs, query]);
  const loggedCounts = useMemo(() => countLoggedSessionsByName(sessionLogs), [sessionLogs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <ScreenTitle subtitle="Every exercise you can use, in any program. Tap one to see or edit its notes.">Exercises</ScreenTitle>
          </View>
          <ProfileButton />
        </View>

        <Button
          label="Check logged weights for big jumps"
          variant="outline"
          onPress={() => router.push('/modals/history-check')}
          style={{ marginTop: 4, marginBottom: 2 }}
        />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises…"
          placeholderTextColor={colors.textFaint}
          style={styles.search}
        />

        {groups.length === 0 ? (
          <Text style={styles.emptyText}>No exercises match &ldquo;{query}&rdquo;.</Text>
        ) : (
          groups.map(({ group, exercises }) => (
            <View key={group} style={{ marginBottom: 18 }}>
              <SectionHeader>{group}</SectionHeader>
              <Card padded={false}>
                {exercises.map((exercise, i) => (
                  <Pressable
                    key={exercise.name}
                    onPress={() => router.push({ pathname: '/modals/exercise-detail', params: { name: exercise.name } })}
                    style={[styles.row, i !== exercises.length - 1 && styles.rowBorder]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      {(loggedCounts.get(exercise.name.toLowerCase()) ?? 0) > 0 && (
                        <Text style={styles.loggedText}>
                          Logged in {loggedCounts.get(exercise.name.toLowerCase())} session{loggedCounts.get(exercise.name.toLowerCase()) === 1 ? '' : 's'}
                        </Text>
                      )}
                      {exercise.muscleGroups.length > 0 && (
                        <View style={styles.badgeRow}>
                          {exercise.muscleGroups.map((m: MuscleGroup) => (
                            <Badge key={m} label={m} color={getMuscleColor(m)} />
                          ))}
                        </View>
                      )}
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  search: {
    color: colors.textPrimary,
    fontSize: 15,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  exerciseName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  loggedText: { color: colors.gold, fontSize: 12, fontWeight: '600', marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});
