import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, SectionHeader, serif } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { ModalHeader } from '@/components/ModalHeader';
import { CheckIcon, TrashIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';

export default function ProgramPicker() {
  const programs = useStore((s) => s.programs);
  const activeProgramId = useStore((s) => s.activeProgramId);
  const setActiveProgram = useStore((s) => s.setActiveProgram);
  const addProgram = useStore((s) => s.addProgram);
  const deleteProgram = useStore((s) => s.deleteProgram);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Programs" />

        <GlassCard style={{ marginBottom: 18 }}>
          {programs.map((p, i) => (
            <View key={p.id} style={[styles.row, i !== programs.length - 1 && styles.rowBorder]}>
              <Pressable style={{ flex: 1 }} onPress={() => onSelect(p.id)}>
                <Text style={styles.programName}>{p.name}</Text>
                <Text style={styles.programMeta}>{p.days.length} workout days</Text>
              </Pressable>
              {p.id === activeProgramId && <CheckIcon color={colors.gold} />}
              <Pressable hitSlop={10} onPress={() => onDelete(p.id, p.name)} style={{ marginLeft: 14 }}>
                <TrashIcon color={colors.textFaint} size={16} />
              </Pressable>
            </View>
          ))}
        </GlassCard>

        {creating ? (
          <GlassCard>
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
          </GlassCard>
        ) : (
          <Button label="New Program" variant="glass" onPress={() => setCreating(true)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  programName: { fontFamily: serif, fontSize: 17, color: colors.textPrimary },
  programMeta: { color: colors.textFaint, fontSize: 12, marginTop: 2 },
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
