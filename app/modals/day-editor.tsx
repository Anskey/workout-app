import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { generateId, useStore } from '@/store/useStore';

export default function DayEditor() {
  const { programId, dayId } = useLocalSearchParams<{ programId: string; dayId?: string }>();
  const programs = useStore((s) => s.programs);
  const upsertDay = useStore((s) => s.upsertDay);
  const deleteDay = useStore((s) => s.deleteDay);

  const program = programs.find((p) => p.id === programId);
  const existing = useMemo(() => program?.days.find((d) => d.id === dayId), [program, dayId]);

  const [name, setName] = useState(existing?.name ?? '');

  const onSave = () => {
    if (!name.trim() || !programId) return;
    upsertDay(programId, existing ?? { id: generateId(), name: name.trim(), exercises: [] });
    if (existing && name.trim() !== existing.name) {
      upsertDay(programId, { ...existing, name: name.trim() });
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing || !programId) return;
    Alert.alert('Delete day?', `"${existing.name}" and all its exercises will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteDay(programId, existing.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
          <ModalHeader title={existing ? 'Edit Day' : 'New Day'} />

          <Card>
            <SectionHeader>Day Name</SectionHeader>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Push #1"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </Card>

          <Button label="Save" onPress={onSave} disabled={!name.trim()} style={{ marginTop: 20 }} />
          {existing && <Button label="Delete Day" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
