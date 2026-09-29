import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Pill, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { TrendChart } from '@/components/TrendChart';
import { useStore } from '@/store/useStore';
import { getIdealMeasurements, GROW_TOWARD_IDEAL, MEASUREMENT_LABELS } from '@/data/idealRatios';
import { cmToDisplayLength } from '@/logic/units';
import { DATE_WINDOWS, filterByWindow, type DateWindow } from '@/logic/dateWindows';
import type { MeasurementKey } from '@/types';

const KEYS: MeasurementKey[] = [
  'neckCm',
  'shouldersCm',
  'chestCm',
  'waistCm',
  'hipsCm',
  'bicepCm',
  'forearmCm',
  'thighCm',
  'calfCm',
];

export default function Trends() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);
  const [window, setWindowKey] = useState<DateWindow>('6m');

  const sorted = useMemo(() => [...measurements].sort((a, b) => a.date.localeCompare(b.date)), [measurements]);
  const windowed = useMemo(() => filterByWindow(sorted, window), [sorted, window]);

  const ideal = getIdealMeasurements(profile.heightCm, profile.sex, profile.idealPreset);

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Trends" />
        <Text style={styles.subtitle}>Each body part over time, against your {profile.idealPreset} reference.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={styles.pillRow}>
            {DATE_WINDOWS.map((w) => (
              <Pill key={w.key} label={w.label} active={window === w.key} onPress={() => setWindowKey(w.key)} />
            ))}
          </View>
        </ScrollView>

        {KEYS.map((key) => {
          const points = windowed
            .filter((m) => m[key] != null)
            .map((m) => ({ date: m.date, value: cmToDisplayLength(m[key] as number, profile.lengthUnit) }));
          return (
            <Card key={key} style={{ marginBottom: 16 }}>
              <SectionHeader>{MEASUREMENT_LABELS[key]}</SectionHeader>
              <TrendChart
                points={points}
                unit={profile.lengthUnit}
                goalValue={cmToDisplayLength(ideal[key], profile.lengthUnit)}
                higherIsBetter={GROW_TOWARD_IDEAL[key]}
                onPointPress={(p) => {
                  const entry = measurements.find((m) => m.date === p.date);
                  if (entry) router.push({ pathname: '/modals/measurement-log', params: { entryId: entry.id } });
                }}
              />
            </Card>
          );
        })}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 18, marginTop: -6 },
  pillRow: { flexDirection: 'row' },
});
