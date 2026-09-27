import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { DateField } from '@/components/DateField';
import { useStore } from '@/store/useStore';
import { todayISODate } from '@/logic/dates';
import { measurementFromDisplay, measurementToDisplay, measurementUnitLabel } from '@/logic/units';
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

export default function MeasurementLog() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const measurements = useStore((s) => s.measurements);
  const addMeasurement = useStore((s) => s.addMeasurement);
  const updateMeasurement = useStore((s) => s.updateMeasurement);
  const deleteMeasurement = useStore((s) => s.deleteMeasurement);
  const weightUnit = useStore((s) => s.profile.weightUnit);
  const lengthUnit = useStore((s) => s.profile.lengthUnit);

  const existing = useMemo(() => measurements.find((m) => m.id === entryId), [measurements, entryId]);
  const [date, setDate] = useState(existing?.date ?? todayISODate());

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FIELDS.forEach((f) => {
      const v = existing?.[f.key];
      if (v != null) init[f.key] = String(measurementToDisplay(f.key, v, weightUnit, lengthUnit));
    });
    return init;
  });

  const onChange = (key: MeasurementKey, text: string) => setValues((v) => ({ ...v, [key]: text }));

  const onSave = () => {
    const parsed: Partial<Record<MeasurementKey, number>> = {};
    FIELDS.forEach((f) => {
      const n = parseFloat(values[f.key] ?? '');
      if (Number.isFinite(n)) parsed[f.key] = measurementFromDisplay(f.key, n, weightUnit, lengthUnit);
    });
    if (existing) {
      updateMeasurement({ ...existing, date, ...parsed });
    } else {
      addMeasurement({ date, ...parsed });
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete entry?', 'This measurement entry will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteMeasurement(existing.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Measurements" />
        <DateField dateISO={date} onChange={setDate} />

        <Card>
          <SectionHeader>Values</SectionHeader>
          {FIELDS.map((f) => (
            <MeasurementField
              key={f.key}
              label={f.label}
              unit={measurementUnitLabel(f.key, weightUnit, lengthUnit)}
              value={values[f.key] ?? ''}
              onChangeText={(t) => onChange(f.key, t)}
            />
          ))}
        </Card>

        <Button label="Save" onPress={onSave} style={{ marginTop: 20 }} />
        {existing && <Button label="Delete Entry" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
});
