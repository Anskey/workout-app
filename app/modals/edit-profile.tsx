import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, Pill, SectionHeader } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import type { ActivityLevel, Goal, Sex } from '@/types';

const GOALS: { key: Goal; label: string }[] = [
  { key: 'bulk', label: 'Build Muscle' },
  { key: 'cut', label: 'Lose Fat' },
  { key: 'maintain', label: 'Maintain' },
];

const ACTIVITY: { key: ActivityLevel; label: string }[] = [
  { key: 'sedentary', label: 'Sedentary' },
  { key: 'light', label: 'Light' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'active', label: 'Active' },
  { key: 'very_active', label: 'Very Active' },
];

export default function EditProfile() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);

  const [name, setName] = useState(profile.name);
  const [heightCm, setHeightCm] = useState(String(profile.heightCm));
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);

  const onSave = () => {
    setProfile({ name, heightCm: Number(heightCm) || profile.heightCm, sex, goal, activityLevel });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ModalHeader title="Profile & Goals" />

        <GlassCard>
          <SectionHeader>Name</SectionHeader>
          <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.textFaint} style={styles.input} />

          <SectionHeader>Height</SectionHeader>
          <View style={styles.inputRow}>
            <TextInput
              value={heightCm}
              onChangeText={(t) => setHeightCm(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
            />
            <Text style={styles.unit}>cm</Text>
          </View>

          <SectionHeader>Sex</SectionHeader>
          <View style={styles.pillRow}>
            {(['male', 'female'] as Sex[]).map((s) => (
              <Pill key={s} label={s === 'male' ? 'Male' : 'Female'} active={sex === s} onPress={() => setSex(s)} />
            ))}
          </View>

          <SectionHeader>Goal</SectionHeader>
          <View style={styles.pillRow}>
            {GOALS.map((g) => (
              <Pill key={g.key} label={g.label} active={goal === g.key} onPress={() => setGoal(g.key)} />
            ))}
          </View>

          <SectionHeader>Activity Level</SectionHeader>
          <View style={[styles.pillRow, { flexWrap: 'wrap' }]}>
            {ACTIVITY.map((a) => (
              <Pill key={a.key} label={a.label} active={activityLevel === a.key} onPress={() => setActivityLevel(a.key)} />
            ))}
          </View>
        </GlassCard>

        <Button label="Save" onPress={onSave} style={{ marginTop: 20 }} />
      </ScrollView>
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
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  unit: { color: colors.textFaint, fontSize: 13 },
  pillRow: { flexDirection: 'row', marginBottom: 10 },
});
