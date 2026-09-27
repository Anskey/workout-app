import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, Pill, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { buildExerciseLibrary } from '@/data/exerciseLibrary';
import { getMuscleColor } from '@/data/muscleGroups';
import { getDefaultProgram } from '@/data/seedProgram';
import type { MuscleGroup } from '@/types';

interface Alternative {
  name: string;
  muscleGroups: MuscleGroup[];
  isOriginal?: boolean;
}

export default function ExerciseSwap() {
  const { programId, dayId, exerciseId } = useLocalSearchParams<{ programId: string; dayId: string; exerciseId: string }>();
  const programs = useStore((s) => s.programs);
  const upsertExercise = useStore((s) => s.upsertExercise);

  const program = programs.find((p) => p.id === programId);
  const day = program?.days.find((d) => d.id === dayId);
  const existing = day?.exercises.find((e) => e.id === exerciseId);

  const library = useMemo(() => buildExerciseLibrary(programs), [programs]);
  const libraryByName = useMemo(() => {
    const map = new Map<string, MuscleGroup[]>();
    library.forEach((l) => map.set(l.name.toLowerCase(), l.muscleGroups));
    return map;
  }, [library]);

  const original = useMemo(
    () => getDefaultProgram(programId ?? '')?.days.find((d) => d.id === dayId)?.exercises.find((e) => e.id === exerciseId),
    [programId, dayId, exerciseId]
  );

  const programAlternatives = useMemo(() => {
    const current = existing?.name.toLowerCase();
    const list: Alternative[] = [];
    // If this slot has been swapped, offer the program's original exercise first.
    if (original && !original.isWeakPointSlot && original.name.toLowerCase() !== current) {
      list.push({ name: original.name, muscleGroups: original.muscleGroups, isOriginal: true });
    }
    (existing?.substitutions ?? [])
      .filter((name) => name.trim().length > 0 && !/^pick a lagging/i.test(name))
      .forEach((name) => {
        const key = name.toLowerCase();
        if (key === current || list.some((a) => a.name.toLowerCase() === key)) return;
        list.push({ name, muscleGroups: libraryByName.get(key) ?? existing?.muscleGroups ?? [] });
      });
    return list;
  }, [existing, original, libraryByName]);
  const programAlternativeNames = useMemo(() => new Set(programAlternatives.map((a) => a.name.toLowerCase())), [programAlternatives]);

  const musclesPresent = useMemo(() => {
    const set = new Set<MuscleGroup>();
    library.forEach((l) => l.muscleGroups.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [library]);

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'All'>('All');

  const filtered = library.filter((item) => {
    if (existing && item.name.toLowerCase() === existing.name.toLowerCase()) return false;
    if (programAlternativeNames.has(item.name.toLowerCase())) return false;
    if (muscleFilter !== 'All' && !item.muscleGroups.includes(muscleFilter)) return false;
    if (search.trim() && !item.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const onSelect = (name: string, muscleGroups: MuscleGroup[]) => {
    if (!existing || !programId || !dayId) return;
    // Substitutions describe this slot in the program, not the specific exercise
    // currently equipped, so they carry over unchanged across swaps.
    upsertExercise(programId, dayId, {
      ...existing,
      name,
      muscleGroups,
    });
    router.back();
  };

  const onEditManually = () => {
    router.replace({ pathname: '/modals/exercise-editor', params: { programId, dayId, exerciseId } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Swap Exercise" />
        {existing && <Text style={styles.subtitle}>Replacing “{existing.name}” — same sets/reps, different movement.</Text>}

        {programAlternatives.length > 0 && (
          <>
            <SectionHeader>Alternatives From This Program</SectionHeader>
            <Card padded={false} style={{ marginBottom: 22 }}>
              {programAlternatives.map((item, i) => (
                <Pressable
                  key={item.name}
                  onPress={() => onSelect(item.name, item.muscleGroups)}
                  style={[styles.row, i !== programAlternatives.length - 1 && styles.rowBorder]}
                >
                  <Text style={styles.rowName}>{item.name}</Text>
                  {item.isOriginal && <Text style={styles.originalTag}>Original program exercise</Text>}
                  <View style={styles.badgeRow}>
                    {item.muscleGroups.map((m) => (
                      <Badge key={m} label={m} color={getMuscleColor(m)} />
                    ))}
                  </View>
                </Pressable>
              ))}
            </Card>
          </>
        )}

        <SectionHeader>Or Choose a Completely Different Exercise</SectionHeader>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises…"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <Pill label="All" active={muscleFilter === 'All'} onPress={() => setMuscleFilter('All')} />
          {musclesPresent.map((m) => (
            <Pill key={m} label={m} active={muscleFilter === m} onPress={() => setMuscleFilter(m)} />
          ))}
        </ScrollView>

        <Card padded={false}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No matches — try a different search or muscle filter.</Text>
          ) : (
            filtered.slice(0, 100).map((item, i) => (
              <Pressable
                key={item.name}
                onPress={() => onSelect(item.name, item.muscleGroups)}
                style={[styles.row, i !== Math.min(filtered.length, 100) - 1 && styles.rowBorder]}
              >
                <Text style={styles.rowName}>{item.name}</Text>
                <View style={styles.badgeRow}>
                  {item.muscleGroups.map((m) => (
                    <Badge key={m} label={m} color={getMuscleColor(m)} />
                  ))}
                </View>
              </Pressable>
            ))
          )}
        </Card>

        <Button label="Can't find it? Edit manually" variant="ghost" onPress={onEditManually} style={{ marginTop: 18 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  subtitle: { color: colors.textSecondary, fontSize: 13.5, marginTop: -10, marginBottom: 16 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  emptyText: { color: colors.textSecondary, fontSize: 14, padding: 18 },
  row: { paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowName: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  originalTag: { color: colors.gold, fontSize: 12, fontWeight: '600', marginTop: -3, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
