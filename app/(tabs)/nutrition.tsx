import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { ProfileButton } from '@/components/ProfileButton';
import { Button, Pill, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { StatTile } from '@/components/StatTile';
import { SparkleIcon } from '@/components/Icons';
import { LiftHistoryChart } from '@/components/LiftHistoryChart';
import { useStore } from '@/store/useStore';
import { compareToIdeal, getLatestMeasurement, getNutritionSuggestion, getSuggestedGoal } from '@/logic/recommendations';
import { formatShortDate, todayISODate } from '@/logic/dates';
import { kgToDisplayValue } from '@/logic/units';
import { DATE_WINDOWS, filterByWindow, type DateWindow } from '@/logic/dateWindows';
import type { HistoryPoint } from '@/logic/sessionHistory';

const ROW_HEIGHT = 44;
const DATE_COL_WIDTH = 76;
const DATA_COL_WIDTH = 76;
type NutritionColumn = 'calories' | 'proteinG' | 'weightKg' | 'steps';
const COLUMNS: { key: NutritionColumn; label: string }[] = [
  { key: 'calories', label: 'Cal' },
  { key: 'proteinG', label: 'Protein' },
  { key: 'weightKg', label: 'Weight' },
  { key: 'steps', label: 'Steps' },
];

export default function Nutrition() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);
  const nutritionLogs = useStore((s) => s.nutritionLogs);
  const [window, setWindowKey] = useState<DateWindow>('6m');

  const latestMeasurement = getLatestMeasurement(measurements);
  const comparisons = compareToIdeal(latestMeasurement, profile);
  const effectiveGoal = profile.goalMode === 'auto' ? getSuggestedGoal(comparisons) : profile.goal;
  const suggestion = getNutritionSuggestion(nutritionLogs, effectiveGoal);
  const sorted = [...nutritionLogs].sort((a, b) => b.date.localeCompare(a.date));
  const today = todayISODate();
  const todayLog = sorted.find((n) => n.date === today);

  // Oldest-first, weight-only, filtered to the selected window — the trend chart
  // plots left-to-right by date, and months of daily entries in one small chart
  // just reads as noise without a way to narrow the range.
  const weightPoints = useMemo<HistoryPoint[]>(
    () =>
      filterByWindow(
        [...nutritionLogs].filter((n) => n.weightKg != null).sort((a, b) => a.date.localeCompare(b.date)),
        window
      ).map((n) => ({ date: n.date, topSet: { weightKg: n.weightKg } })),
    [nutritionLogs, window]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <ScreenTitle subtitle="Daily calories, protein, and weight — with weekly-trend suggestions.">Nutrition</ScreenTitle>
          </View>
          <ProfileButton />
        </View>

        <Card style={{ marginBottom: 18 }}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <StatTile
                label="Calories"
                value={todayLog?.calories ? String(todayLog.calories) : '—'}
                unit="kcal"
                target={profile.calorieTarget ? String(profile.calorieTarget) : undefined}
              />
            </View>
            <View style={styles.statCell}>
              <StatTile
                label="Protein"
                value={todayLog?.proteinG ? String(todayLog.proteinG) : '—'}
                unit="g"
                accent={colors.gold}
                target={profile.proteinTargetG ? String(profile.proteinTargetG) : undefined}
              />
            </View>
            <View style={styles.statCell}>
              <StatTile
                label="Weight"
                value={todayLog?.weightKg ? String(kgToDisplayValue(todayLog.weightKg, profile.weightUnit)) : '—'}
                unit={profile.weightUnit}
              />
            </View>
            <View style={styles.statCell}>
              <StatTile
                label="Steps"
                value={todayLog?.steps ? String(todayLog.steps) : '—'}
                target={profile.stepsTarget ? String(profile.stepsTarget) : undefined}
              />
            </View>
          </View>
          <Button
            label={todayLog ? 'Update Today' : 'Log Today'}
            onPress={() =>
              router.push(
                todayLog
                  ? { pathname: '/modals/nutrition-log', params: { entryId: todayLog.id } }
                  : '/modals/nutrition-log'
              )
            }
            style={{ marginTop: 16 }}
          />
        </Card>

        <SectionHeader>Suggestions</SectionHeader>
        <Card style={{ marginBottom: 18 }}>
          {suggestion.messages.map((m, i) => (
            <View key={i} style={[styles.suggestionRow, i !== suggestion.messages.length - 1 && styles.suggestionRowBorder]}>
              <SparkleIcon color={colors.gold} size={15} />
              <Text style={styles.suggestionText}>{m}</Text>
            </View>
          ))}
          {suggestion.proteinTargetG && (
            <Text style={styles.targetText}>Protein target: ~{suggestion.proteinTargetG}g/day (≈1g per lb bodyweight)</Text>
          )}
        </Card>

        <SectionHeader>Weight History</SectionHeader>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={styles.pillRow}>
            {DATE_WINDOWS.map((w) => (
              <Pill key={w.key} label={w.label} active={window === w.key} onPress={() => setWindowKey(w.key)} />
            ))}
          </View>
        </ScrollView>
        {weightPoints.length > 0 && (
          <Card style={{ marginBottom: 18 }}>
            <LiftHistoryChart
              points={weightPoints}
              weightUnit={profile.weightUnit}
              onPointPress={(p) => {
                const entry = nutritionLogs.find((n) => n.date === p.date);
                if (entry) router.push({ pathname: '/modals/nutrition-log', params: { entryId: entry.id } });
              }}
            />
          </Card>
        )}

        <SectionHeader>History</SectionHeader>
        <Card padded={false}>
          {sorted.length === 0 ? (
            <Text style={[styles.emptyText, { padding: 18 }]}>No entries yet.</Text>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              {/* Frozen date column — stays put while the calorie/protein/weight/steps
                  columns scroll together as one, so every row stays lined up. */}
              <View style={{ width: DATE_COL_WIDTH }}>
                <View style={[styles.gridCell, styles.gridHeaderCell, { width: DATE_COL_WIDTH, alignItems: 'flex-start' }]}>
                  <Text style={styles.gridHeaderText}>Date</Text>
                </View>
                {sorted.map((n, i) => (
                  <Pressable
                    key={n.id}
                    onPress={() => router.push({ pathname: '/modals/nutrition-log', params: { entryId: n.id } })}
                    style={[
                      styles.gridCell,
                      { width: DATE_COL_WIDTH, alignItems: 'flex-start' },
                      i !== sorted.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <Text style={styles.gridDateText}>{formatShortDate(n.date)}</Text>
                  </Pressable>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    {COLUMNS.map((col) => (
                      <View key={col.key} style={[styles.gridCell, styles.gridHeaderCell, { width: DATA_COL_WIDTH }]}>
                        <Text style={styles.gridHeaderText}>{col.label}</Text>
                      </View>
                    ))}
                  </View>
                  {sorted.map((n, i) => (
                    <View key={n.id} style={{ flexDirection: 'row' }}>
                      {COLUMNS.map((col) => (
                        <Pressable
                          key={col.key}
                          onPress={() => router.push({ pathname: '/modals/nutrition-log', params: { entryId: n.id } })}
                          style={[styles.gridCell, { width: DATA_COL_WIDTH }, i !== sorted.length - 1 && styles.rowBorder]}
                        >
                          <Text style={styles.gridValueText}>
                            {col.key === 'weightKg'
                              ? n.weightKg != null
                                ? `${kgToDisplayValue(n.weightKg, profile.weightUnit)}${profile.weightUnit}`
                                : '—'
                              : n[col.key] != null
                              ? String(n[col.key])
                              : '—'}
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
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, ...insetWell, borderRadius: 14, padding: 14 },
  statCell: { width: '42%' },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 10 },
  suggestionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  suggestionText: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 19, flex: 1 },
  targetText: { color: colors.textFaint, fontSize: 12, marginTop: 10 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  pillRow: { flexDirection: 'row' },
  gridCell: { height: ROW_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  gridHeaderCell: { backgroundColor: colors.bgAlt },
  gridHeaderText: { color: colors.textFaint, fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  gridDateText: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '600' },
  gridValueText: { color: colors.textSecondary, fontSize: 12.5 },
});
