import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, Pill, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { useOnboardingDraft } from '@/store/onboardingDraft';
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

export default function Profile() {
  const draft = useOnboardingDraft();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle subtitle="This tunes your reference measurements and daily targets.">About You</ScreenTitle>

        <Card style={styles.card}>
          <SectionHeader>Name (optional)</SectionHeader>
          <TextInput
            value={draft.name}
            onChangeText={(t) => draft.setField('name', t)}
            placeholder="Your name"
            placeholderTextColor={colors.textFaint}
            style={styles.textInput}
          />

          <SectionHeader>Height</SectionHeader>
          <View style={styles.inputRow}>
            <TextInput
              value={String(draft.heightCm)}
              onChangeText={(t) => draft.setField('heightCm', Number(t.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="number-pad"
              style={[styles.textInput, { flex: 1 }]}
            />
            <Text style={styles.unit}>cm</Text>
          </View>

          <SectionHeader>Sex</SectionHeader>
          <View style={styles.pillRow}>
            {(['male', 'female'] as Sex[]).map((s) => (
              <Pill key={s} label={s === 'male' ? 'Male' : 'Female'} active={draft.sex === s} onPress={() => draft.setField('sex', s)} />
            ))}
          </View>

          <SectionHeader>Goal</SectionHeader>
          <View style={styles.pillRow}>
            {GOALS.map((g) => (
              <Pill key={g.key} label={g.label} active={draft.goal === g.key} onPress={() => draft.setField('goal', g.key)} />
            ))}
          </View>

          <SectionHeader>Activity Level</SectionHeader>
          <View style={[styles.pillRow, { flexWrap: 'wrap' }]}>
            {ACTIVITY.map((a) => (
              <Pill key={a.key} label={a.label} active={draft.activityLevel === a.key} onPress={() => draft.setField('activityLevel', a.key)} />
            ))}
          </View>
        </Card>

        <Button label="Continue" onPress={() => router.push('/onboarding/measurements')} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  card: { gap: 2 },
  textInput: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  unit: { color: colors.textFaint, fontSize: 13 },
  pillRow: { flexDirection: 'row', marginBottom: 10 },
});
