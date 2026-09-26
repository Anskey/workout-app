import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, SectionHeader } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ModalHeader title={existing ? 'Edit Day' : 'New Day'} />

          <GlassCard>
            <SectionHeader>Day Name</SectionHeader>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Push #1"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </GlassCard>

          <Button label="Save" onPress={onSave} disabled={!name.trim()} style={{ marginTop: 20 }} />
          {existing && <Button label="Delete Day" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
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
  },
});
