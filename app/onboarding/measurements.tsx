import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { MeasurementField } from '@/components/MeasurementField';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import type { MeasurementKey } from '@/types';

const FIELDS: { key: MeasurementKey; label: string; unit?: string }[] = [
  { key: 'weightKg', label: 'Body Weight', unit: 'kg' },
  { key: 'neckCm', label: 'Neck' },
  { key: 'shouldersCm', label: 'Shoulders' },
  { key: 'chestCm', label: 'Chest / Bust' },
  { key: 'waistCm', label: 'Waist' },
  { key: 'hipsCm', label: 'Hips' },
  { key: 'bicepCm', label: 'Bicep (flexed)' },
  { key: 'forearmCm', label: 'Forearm' },
  { key: 'thighCm', label: 'Thigh' },
  { key: 'calfCm', label: 'Calf' },
];

export default function Measurements() {
  const draft = useOnboardingDraft();
  const [values, setValues] = useState<Record<string, string>>({});

  const onChange = (key: MeasurementKey, text: string) => {
    setValues((v) => ({ ...v, [key]: text }));
    const n = parseFloat(text);
    draft.setMeasurement(key, Number.isFinite(n) ? n : undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle subtitle="Take these with a soft tape, relaxed unless noted. Skip any you can't measure right now.">
          Starting Measurements
        </ScreenTitle>

        <GlassCard>
          <SectionHeader>This Week</SectionHeader>
          {FIELDS.map((f) => (
            <MeasurementField
              key={f.key}
              label={f.label}
              unit={f.unit}
              value={values[f.key] ?? ''}
              onChangeText={(t) => onChange(f.key, t)}
            />
          ))}
        </GlassCard>

        <Button label="See Comparison" onPress={() => router.push('/onboarding/results')} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
});
