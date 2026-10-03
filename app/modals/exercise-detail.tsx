import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { LiftHistoryChart } from '@/components/LiftHistoryChart';
import { useStore } from '@/store/useStore';
import { getMuscleColor } from '@/data/muscleGroups';
import { getFormCues } from '@/data/formCues';
import { buildExerciseLibrary } from '@/data/exerciseLibrary';
import { getExerciseNote } from '@/logic/exerciseNotes';
import { formatSet, getExerciseHistoryByName } from '@/logic/sessionHistory';

/** A program-independent view of one exercise: its muscles, your notes on it, form cues and
 * lift history across everything you've logged — no sets/reps, since those belong to a program. */
export default function ExerciseDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const exerciseName = name ?? '';
  const programs = useStore((s) => s.programs);
  const sessionLogs = useStore((s) => s.sessionLogs);
  const exerciseNotes = useStore((s) => s.exerciseNotes);
  const setExerciseNote = useStore((s) => s.setExerciseNote);
  const weightUnit = useStore((s) => s.profile.weightUnit);

  const [note, setNote] = useState(() => getExerciseNote(exerciseName, exerciseNotes));

  const muscles = useMemo(
    () => buildExerciseLibrary(programs).find((e) => e.name.toLowerCase() === exerciseName.trim().toLowerCase())?.muscleGroups ?? [],
    [programs, exerciseName]
  );
  const history = useMemo(() => getExerciseHistoryByName(sessionLogs, exerciseName), [sessionLogs, exerciseName]);
  const best = history.length > 0 ? history[history.length - 1].topSet : undefined;
  const cues = getFormCues(exerciseName);

  const onSave = () => {
    setExerciseNote(exerciseName, note.trim());
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title={exerciseName} />

        {muscles.length > 0 && (
          <View style={styles.badgeRow}>
            {muscles.map((m) => (
              <Badge key={m} label={m} color={getMuscleColor(m)} />
            ))}
          </View>
        )}

        <Card style={{ marginBottom: 16 }}>
          <SectionHeader>Notes</SectionHeader>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Your notes on this exercise — setup, cues, what to watch for…"
            placeholderTextColor={colors.textFaint}
            multiline
            style={styles.notesInput}
          />
          {cues && (
            <>
              <SectionHeader>Form Cues</SectionHeader>
              <View style={styles.cuesBox}>
                {cues.map((c, i) => (
                  <Text key={i} style={styles.cueText}>
                    · {c}
                  </Text>
                ))}
              </View>
            </>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionHeader>Lift History</SectionHeader>
          {best && <Text style={styles.lastText}>Last best: {formatSet(best, weightUnit)}</Text>}
          <LiftHistoryChart points={history} weightUnit={weightUnit} />
        </Card>

        <Button label="Save Notes" onPress={onSave} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, marginTop: -4 },
  notesInput: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 6,
  },
  cuesBox: { backgroundColor: colors.bgAlt, borderRadius: 2, padding: 10, marginTop: 4 },
  cueText: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  lastText: { color: colors.gold, fontSize: 12.5, fontWeight: '600', marginBottom: 10, marginTop: -6 },
});
