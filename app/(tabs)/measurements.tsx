import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { ProfileButton } from '@/components/ProfileButton';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ComparisonBar } from '@/components/ComparisonBar';
import { useStore } from '@/store/useStore';
import { compareToIdeal, getLatestMeasurement } from '@/logic/recommendations';
import { formatLongDate, formatShortDate } from '@/logic/dates';
import { formatLength } from '@/logic/units';
import { IDEAL_PRESETS, MEASUREMENT_LABELS, getIdealMeasurements } from '@/data/idealRatios';
import { BodyComparisonFigure } from '@/components/BodyComparisonFigure';
import type { MeasurementKey } from '@/types';

const HISTORY_KEYS = Object.keys(MEASUREMENT_LABELS) as MeasurementKey[];

// Short header labels for the history grid's columns — the full names from
// MEASUREMENT_LABELS are used elsewhere (comparisons, the entry form) where there's
// room; here they'd force each column much wider than the values need.
const COLUMN_LABELS: Record<MeasurementKey, string> = {
  neckCm: 'Neck',
  shouldersCm: 'Shldrs',
  chestCm: 'Chest',
  waistCm: 'Waist',
  hipsCm: 'Hips',
  bicepCm: 'Bicep',
  forearmCm: 'Frm',
  thighCm: 'Thigh',
  calfCm: 'Calf',
};

const ROW_HEIGHT = 44;
const DATE_COL_WIDTH = 76;
const DATA_COL_WIDTH = 64;

export default function Measurements() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);

  const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
  const latest = getLatestMeasurement(measurements);
  const comparisons = compareToIdeal(latest, profile);
  const ideal = getIdealMeasurements(profile.heightCm, profile.sex, profile.idealPreset);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <ScreenTitle subtitle="Weekly check-ins keep your comparison and suggestions current.">Measurements</ScreenTitle>
          </View>
          <ProfileButton />
        </View>

        <Button label="Log New Measurements" onPress={() => router.push('/modals/measurement-log')} style={{ marginBottom: 20 }} />

        <SectionHeader
          right={
            latest ? (
              <Pressable onPress={() => router.push({ pathname: '/modals/measurement-log', params: { entryId: latest.id } })}>
                <Text style={styles.goldLink}>Edit Latest</Text>
              </Pressable>
            ) : undefined
          }
        >
          Latest vs. {IDEAL_PRESETS[profile.idealPreset].label}
        </SectionHeader>
        <Card style={{ marginBottom: 20 }}>
          {latest && <Text style={styles.dateLabel}>{formatLongDate(latest.date)}</Text>}
          <BodyComparisonFigure actual={latest} ideal={ideal} />
          {comparisons.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {comparisons.map((c) => (
                <ComparisonBar key={c.key} comparison={c} unit={profile.lengthUnit} />
              ))}
            </View>
          )}
        </Card>

        <SectionHeader
          right={
            <Pressable onPress={() => router.push('/modals/trends')}>
              <Text style={styles.goldLink}>View Trends</Text>
            </Pressable>
          }
        >
          History
        </SectionHeader>
        <Card padded={false}>
          {sorted.length === 0 ? (
            <Text style={[styles.emptyText, { padding: 18 }]}>No entries yet.</Text>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              {/* Frozen date column — stays put while the measurement columns scroll. */}
              <View style={{ width: DATE_COL_WIDTH }}>
                <View style={[styles.gridCell, styles.gridHeaderCell, { width: DATE_COL_WIDTH, alignItems: 'flex-start' }]}>
                  <Text style={styles.gridHeaderText}>Date</Text>
                </View>
                {sorted.map((m, i) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push({ pathname: '/modals/measurement-log', params: { entryId: m.id } })}
                    style={[
                      styles.gridCell,
                      { width: DATE_COL_WIDTH, alignItems: 'flex-start' },
                      i !== sorted.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <Text style={styles.gridDateText}>{formatShortDate(m.date)}</Text>
                  </Pressable>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    {HISTORY_KEYS.map((key) => (
                      <View key={key} style={[styles.gridCell, styles.gridHeaderCell, { width: DATA_COL_WIDTH }]}>
                        <Text style={styles.gridHeaderText}>{COLUMN_LABELS[key]}</Text>
                      </View>
                    ))}
                  </View>
                  {sorted.map((m, i) => (
                    <View key={m.id} style={{ flexDirection: 'row' }}>
                      {HISTORY_KEYS.map((key) => (
                        <Pressable
                          key={key}
                          onPress={() => router.push({ pathname: '/modals/measurement-log', params: { entryId: m.id } })}
                          style={[styles.gridCell, { width: DATA_COL_WIDTH }, i !== sorted.length - 1 && styles.rowBorder]}
                        >
                          <Text style={styles.gridValueText}>
                            {m[key] != null ? formatLength(m[key] as number, profile.lengthUnit) : '—'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
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
  dateLabel: { color: colors.textFaint, fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.6 },
  goldLink: { color: colors.gold, fontSize: 13.5, fontWeight: '600', paddingVertical: 8 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  gridCell: { height: ROW_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  gridHeaderCell: { backgroundColor: colors.bgAlt },
  gridHeaderText: { color: colors.textFaint, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  gridDateText: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '600' },
  gridValueText: { color: colors.textSecondary, fontSize: 12.5 },
});
