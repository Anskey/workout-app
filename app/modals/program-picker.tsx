import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, SectionHeader, serif } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { CheckIcon, TrashIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';
import { DEFAULT_PROGRAM_ID } from '@/data/seedProgram';

export default function ProgramPicker() {
  const programs = useStore((s) => s.programs);
  const activeProgramId = useStore((s) => s.activeProgramId);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const addProgram = useStore((s) => s.addProgram);
  const deleteProgram = useStore((s) => s.deleteProgram);
  const resetProgramToDefault = useStore((s) => s.resetProgramToDefault);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const onSelect = (id: string) => {
    setActiveProgram(id);
    router.back();
  };

  const onCreate = () => {
    if (!newName.trim()) return;
    const id = addProgram({ name: newName.trim(), days: [] });
    setActiveProgram(id);
    router.back();
  };

  const onDelete = (id: string, name: string) => {
    if (programs.length <= 1) {
      Alert.alert('Can’t delete', 'You need at least one program.');
      return;
    }
    Alert.alert('Delete program?', `"${name}" and all its workout days will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProgram(id) },
    ]);
  };

  const onReset = (id: string, name: string) => {
    Alert.alert('Reset program to default?', `"${name}" will revert entirely to the program's original exercises and weeks, undoing all edits and swaps.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetProgramToDefault(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Programs" />

        <Card style={{ marginBottom: 18 }}>
          {programs.map((p, i) => (
            <View key={p.id} style={[styles.row, i !== programs.length - 1 && styles.rowBorder]}>
              <Pressable style={{ flex: 1 }} onPress={() => onSelect(p.id)}>
                <Text style={styles.programName}>{p.name}</Text>
                <Text style={styles.programMeta}>{p.days.length} workout days</Text>
              </Pressable>
              {p.id === activeProgramId && <CheckIcon color={colors.gold} />}
              {p.id === DEFAULT_PROGRAM_ID && (
                <Pressable hitSlop={10} onPress={() => onReset(p.id, p.name)} style={{ marginLeft: 14 }}>
                  <Text style={styles.resetLink}>Reset</Text>
                </Pressable>
              )}
              <Pressable hitSlop={10} onPress={() => onDelete(p.id, p.name)} style={{ marginLeft: 14 }}>
                <TrashIcon color={colors.textFaint} size={16} />
              </Pressable>
            </View>
          ))}
        </Card>

        {creating ? (
          <Card>
            <SectionHeader>New Program Name</SectionHeader>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Summer Cut Split"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              autoFocus
            />
            <Button label="Create" onPress={onCreate} disabled={!newName.trim()} style={{ marginTop: 14 }} />
          </Card>
        ) : (
          <Button label="New Program" variant="outline" onPress={() => setCreating(true)} />
        )}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  programName: { fontFamily: serif, fontSize: 17, color: colors.textPrimary },
  programMeta: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
  resetLink: { color: colors.textFaint, fontSize: 12.5, fontWeight: '600' },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
