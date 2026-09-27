import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { MeasurementField } from '@/components/MeasurementField';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { displayValueToKg } from '@/logic/units';
import type { MeasurementKey } from '@/types';

const FIELDS: { key: MeasurementKey; label: string; unit?: string }[] = [
  { key: 'weightKg', label: 'Body Weight' },
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
    if (!Number.isFinite(n)) {
      draft.setMeasurement(key, undefined);
      return;
    }
    draft.setMeasurement(key, key === 'weightKg' ? displayValueToKg(n, draft.weightUnit) : n);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle subtitle="Take these with a soft tape, relaxed unless noted. Skip any you can't measure right now.">
          Starting Measurements
        </ScreenTitle>

        <Card>
          <SectionHeader>This Week</SectionHeader>
          {FIELDS.map((f) => (
            <MeasurementField
              key={f.key}
              label={f.label}
              unit={f.key === 'weightKg' ? draft.weightUnit : f.unit}
              value={values[f.key] ?? ''}
              onChangeText={(t) => onChange(f.key, t)}
            />
          ))}
        </Card>

        <Button label="See Comparison" onPress={() => router.push('/onboarding/results')} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
});
