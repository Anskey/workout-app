import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ComparisonBar } from '@/components/ComparisonBar';
import { ChevronRightIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';
import { compareToIdeal, getLatestMeasurement } from '@/logic/recommendations';
import { formatLongDate } from '@/logic/dates';
import { formatLength, formatWeight } from '@/logic/units';
import { IDEAL_PRESETS } from '@/data/idealRatios';

export default function Measurements() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);

  const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
  const latest = getLatestMeasurement(measurements);
  const comparisons = compareToIdeal(latest, profile);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <ScreenTitle subtitle="Weekly check-ins keep your comparison and suggestions current.">Measurements</ScreenTitle>
          </View>
          <Pressable onPress={() => router.push('/modals/edit-profile')}>
            <Text style={styles.editProfileLink}>Profile & Goals</Text>
          </Pressable>
        </View>

        <Button label="Log New Measurements" onPress={() => router.push('/modals/measurement-log')} style={{ marginBottom: 20 }} />

        {latest && comparisons.length > 0 && (
          <>
            <SectionHeader>Latest vs. {IDEAL_PRESETS[profile.idealPreset].label}</SectionHeader>
            <Card style={{ marginBottom: 20 }}>
              <Text style={styles.dateLabel}>{formatLongDate(latest.date)}</Text>
              {comparisons.map((c) => (
                <ComparisonBar key={c.key} comparison={c} unit={profile.lengthUnit} />
              ))}
            </Card>
          </>
        )}

        <SectionHeader>History</SectionHeader>
        <Card>
          {sorted.length === 0 ? (
            <Text style={styles.emptyText}>No entries yet.</Text>
          ) : (
            sorted.map((m, i) => (
              <Pressable
                key={m.id}
                onPress={() => router.push({ pathname: '/modals/measurement-log', params: { entryId: m.id } })}
                style={[styles.row, i !== sorted.length - 1 && styles.rowBorder]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowDate}>{formatLongDate(m.date)}</Text>
                  <Text style={styles.rowMeta}>
                    {m.weightKg ? formatWeight(m.weightKg, profile.weightUnit) : '—'}
                    {m.waistCm ? ` · waist ${formatLength(m.waistCm, profile.lengthUnit)}` : ''}
                    {m.calfCm ? ` · calf ${formatLength(m.calfCm, profile.lengthUnit)}` : ''}
                  </Text>
                </View>
                <ChevronRightIcon color={colors.textFaint} />
              </Pressable>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 140 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  editProfileLink: { color: colors.gold, fontSize: 12.5, fontWeight: '600', marginTop: 6 },
  dateLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowDate: { color: colors.textPrimary, fontSize: 14.5, fontWeight: '600' },
  rowMeta: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3 },
});
