import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { MeasurementField } from '@/components/MeasurementField';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { measurementFromDisplay, measurementUnitLabel } from '@/logic/units';
import type { MeasurementKey } from '@/types';

const FIELDS: { key: MeasurementKey; label: string }[] = [
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
    draft.setMeasurement(key, Number.isFinite(n) ? measurementFromDisplay(key, n, draft.weightUnit, draft.lengthUnit) : undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle subtitle="Take these with a soft tape, relaxed unless noted. Skip any you can't measure right now.">
          Starting Measurements
        </ScreenTitle>

        <Card>
          <SectionHeader>This Week</SectionHeader>
          {FIELDS.map((f) => (
            <MeasurementField
              key={f.key}
              label={f.label}
              unit={measurementUnitLabel(f.key, draft.weightUnit, draft.lengthUnit)}
              value={values[f.key] ?? ''}
              onChangeText={(t) => onChange(f.key, t)}
            />
          ))}
        </Card>

        <Button label="See Comparison" onPress={() => router.push('/onboarding/results')} style={{ marginTop: 24 }} />
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
});
