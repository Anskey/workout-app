import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { Button, Pill, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { HeightInput } from '@/components/HeightInput';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import type { ActivityLevel, Goal, LengthUnit, Sex, WeightUnit } from '@/types';

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
      <FormScrollView contentContainerStyle={styles.scroll}>
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

          <SectionHeader>Units</SectionHeader>
          <View style={styles.pillRow}>
            {(['kg', 'lb'] as WeightUnit[]).map((u) => (
              <Pill key={u} label={u === 'kg' ? 'Kilograms' : 'Pounds'} active={draft.weightUnit === u} onPress={() => draft.setField('weightUnit', u)} />
            ))}
          </View>
          <View style={styles.pillRow}>
            {(['cm', 'in'] as LengthUnit[]).map((u) => (
              <Pill key={u} label={u === 'cm' ? 'Centimetres' : 'Feet / Inches'} active={draft.lengthUnit === u} onPress={() => draft.setField('lengthUnit', u)} />
            ))}
          </View>

          <SectionHeader>Height</SectionHeader>
          <HeightInput heightCm={draft.heightCm} unit={draft.lengthUnit} onChange={(cm) => draft.setField('heightCm', cm)} />

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
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  card: { gap: 2 },
  textInput: {
    color: colors.textPrimary,
    fontSize: 16,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  pillRow: { flexDirection: 'row', marginBottom: 10 },
});
