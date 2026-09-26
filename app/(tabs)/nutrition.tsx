import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { StatTile } from '@/components/StatTile';
import { SparkleIcon, ChevronRightIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';
import { getLatestMeasurement, getNutritionSuggestion } from '@/logic/recommendations';
import { formatLongDate, todayISODate } from '@/logic/dates';

export default function Nutrition() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);
  const nutritionLogs = useStore((s) => s.nutritionLogs);

  const latestMeasurement = getLatestMeasurement(measurements);
  const suggestion = getNutritionSuggestion(nutritionLogs, latestMeasurement, profile.goal);
  const sorted = [...nutritionLogs].sort((a, b) => b.date.localeCompare(a.date));
  const today = todayISODate();
  const todayLog = sorted.find((n) => n.date === today);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenTitle subtitle="Daily calories, protein, and weight — with weekly-trend suggestions.">Nutrition</ScreenTitle>

        <Card style={{ marginBottom: 18 }}>
          <View style={styles.statsRow}>
            <StatTile label="Calories" value={todayLog?.calories ? String(todayLog.calories) : '—'} unit="kcal" />
            <StatTile label="Protein" value={todayLog?.proteinG ? String(todayLog.proteinG) : '—'} unit="g" accent={colors.gold} />
            <StatTile label="Weight" value={todayLog?.weightKg ? String(todayLog.weightKg) : '—'} unit="kg" />
          </View>
          <Button label={todayLog ? 'Update Today' : 'Log Today'} onPress={() => router.push('/modals/nutrition-log')} style={{ marginTop: 16 }} />
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
            <Text style={styles.targetText}>Protein target: ~{suggestion.proteinTargetG}g/day (≈2.0g/kg bodyweight)</Text>
          )}
        </Card>

        <SectionHeader>History</SectionHeader>
        <Card>
          {sorted.length === 0 ? (
            <Text style={styles.emptyText}>No entries yet.</Text>
          ) : (
            sorted.slice(0, 21).map((n, i) => (
              <Pressable
                key={n.id}
                onPress={() => router.push({ pathname: '/modals/nutrition-log', params: { entryId: n.id } })}
                style={[styles.row, i !== Math.min(sorted.length, 21) - 1 && styles.rowBorder]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowDate}>{formatLongDate(n.date)}</Text>
                  <Text style={styles.rowMeta}>
                    {n.calories ? `${n.calories} kcal` : '—'} · {n.proteinG ? `${n.proteinG}g protein` : '—'}
                    {n.weightKg ? ` · ${n.weightKg}kg` : ''}
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
  statsRow: { flexDirection: 'row', gap: 16 },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 10 },
  suggestionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  suggestionText: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 19, flex: 1 },
  targetText: { color: colors.textFaint, fontSize: 12, marginTop: 10 },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowDate: { color: colors.textPrimary, fontSize: 14.5, fontWeight: '600' },
  rowMeta: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3 },
});
