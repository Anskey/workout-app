import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, SectionHeader } from '@/theme/ui';
import { GlassCard } from '@/theme/GlassCard';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { useStore } from '@/store/useStore';
import { formatLongDate, todayISODate } from '@/logic/dates';
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

export default function MeasurementLog() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const measurements = useStore((s) => s.measurements);
  const addMeasurement = useStore((s) => s.addMeasurement);
  const updateMeasurement = useStore((s) => s.updateMeasurement);
  const deleteMeasurement = useStore((s) => s.deleteMeasurement);

  const existing = useMemo(() => measurements.find((m) => m.id === entryId), [measurements, entryId]);
  const date = existing?.date ?? todayISODate();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    FIELDS.forEach((f) => {
      const v = existing?.[f.key];
      if (v != null) init[f.key] = String(v);
    });
    return init;
  });

  const onChange = (key: MeasurementKey, text: string) => setValues((v) => ({ ...v, [key]: text }));

  const onSave = () => {
    const parsed: Partial<Record<MeasurementKey, number>> = {};
    FIELDS.forEach((f) => {
      const n = parseFloat(values[f.key] ?? '');
      if (Number.isFinite(n)) parsed[f.key] = n;
    });
    if (existing) {
      updateMeasurement({ ...existing, ...parsed });
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ModalHeader title="Measurements" />
          <Text style={styles.dateLabel}>{formatLongDate(date)}</Text>

          <GlassCard>
            <SectionHeader>Values</SectionHeader>
            {FIELDS.map((f) => (
              <MeasurementField key={f.key} label={f.label} unit={f.unit} value={values[f.key] ?? ''} onChangeText={(t) => onChange(f.key, t)} />
            ))}
          </GlassCard>

          <Button label="Save" onPress={onSave} style={{ marginTop: 20 }} />
          {existing && <Button label="Delete Entry" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  dateLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: -8 },
});
