import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Button, ScreenTitle, SectionHeader, serif } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { StatTile } from '@/components/StatTile';
import { SparkleIcon, ChevronRightIcon } from '@/components/Icons';
import { useStore, useActiveProgram } from '@/store/useStore';
import {
  compareToIdeal,
  getLatestMeasurement,
  getNutritionSuggestion,
  getSuggestedGoal,
  getWorkoutSuggestions,
  measurementReminderInfo,
} from '@/logic/recommendations';
import { todayISODate } from '@/logic/dates';
import { getMuscleColor } from '@/data/muscleGroups';
import { kgToDisplayValue } from '@/logic/units';

export default function Home() {
  const profile = useStore((s) => s.profile);
  const measurements = useStore((s) => s.measurements);
  const nutritionLogs = useStore((s) => s.nutritionLogs);
  const activeProgram = useActiveProgram();

  const latest = getLatestMeasurement(measurements);
  const reminder = measurementReminderInfo(measurements);
  const comparisons = compareToIdeal(latest, profile);
  const workoutSuggestions = getWorkoutSuggestions(comparisons, activeProgram).slice(0, 3);
  const effectiveGoal = profile.goalMode === 'auto' ? getSuggestedGoal(comparisons) : profile.goal;
  const nutritionSuggestion = getNutritionSuggestion(nutritionLogs, latest, effectiveGoal);

  const today = todayISODate();
  const todayLog = nutritionLogs.find((n) => n.date === today);
  const firstDay = activeProgram?.days[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <ScreenTitle subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}>
              {profile.name ? `Hi, ${profile.name}` : 'Welcome back'}
            </ScreenTitle>
          </View>
          <Pressable onPress={() => router.push('/modals/edit-profile')}>
            <Text style={styles.editProfileLink}>Profile & Goals</Text>
          </Pressable>
        </View>

        {reminder.due && (
          <Card style={styles.reminderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>
                {reminder.daysSinceLast === null ? 'Log your first measurements' : `${reminder.daysSinceLast} days since your last measurements`}
              </Text>
              <Text style={styles.reminderCopy}>Weekly check-ins keep your suggestions accurate.</Text>
            </View>
            <Button label="Log Now" variant="outline" onPress={() => router.push('/modals/measurement-log')} />
          </Card>
        )}

        <SectionHeader>Today</SectionHeader>
        <Card>
          <View style={styles.statsRow}>
            <StatTile label="Calories" value={todayLog?.calories ? String(todayLog.calories) : '—'} unit="kcal" />
            <StatTile label="Protein" value={todayLog?.proteinG ? String(todayLog.proteinG) : '—'} unit="g" accent={colors.gold} />
            <StatTile
              label="Weight"
              value={todayLog?.weightKg ? String(kgToDisplayValue(todayLog.weightKg, profile.weightUnit)) : '—'}
              unit={profile.weightUnit}
            />
          </View>
          <Button
            label={todayLog ? 'Update Today' : 'Log Today'}
            variant="outline"
            onPress={() =>
              router.push(
                todayLog
                  ? { pathname: '/modals/nutrition-log', params: { entryId: todayLog.id } }
                  : '/modals/nutrition-log'
              )
            }
            style={{ marginTop: 14 }}
          />
        </Card>

        <SectionHeader>Weekly Suggestions</SectionHeader>
        <Card>
          {nutritionSuggestion.messages.slice(0, 1).map((m, i) => (
            <SuggestionRow key={`n-${i}`} text={m} />
          ))}
          {workoutSuggestions.length === 0 ? (
            <SuggestionRow text="No lagging body parts flagged yet — keep logging measurements weekly." isLast />
          ) : (
            workoutSuggestions.map((w, i) => (
              <SuggestionRow
                key={w.muscle}
                text={`${w.headline}. ${w.detail}`}
                badge={w.muscle}
                badgeColor={getMuscleColor(w.muscle)}
                isLast={i === workoutSuggestions.length - 1}
              />
            ))
          )}
        </Card>

        <SectionHeader
          right={
            <Text style={styles.link} onPress={() => router.push('/(tabs)/program')}>
              View all
            </Text>
          }
        >
          Your Program
        </SectionHeader>
        <Pressable onPress={() => router.push('/(tabs)/program')}>
          <Card>
            <Text style={styles.programName}>{activeProgram?.name ?? 'No program yet'}</Text>
            {firstDay && (
              <View style={styles.dayPreviewRow}>
                <Text style={styles.dayPreviewText}>
                  {firstDay.name} · {firstDay.exercises.length} exercises
                </Text>
                <ChevronRightIcon color={colors.textFaint} />
              </View>
            )}
          </Card>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionRow({ text, badge, badgeColor, isLast }: { text: string; badge?: string; badgeColor?: string; isLast?: boolean }) {
  return (
    <View style={[styles.suggestionRow, !isLast && styles.suggestionRowBorder]}>
      <SparkleIcon color={colors.gold} size={15} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        {badge ? <Badge label={badge} color={badgeColor ?? colors.gold} /> : null}
        <Text style={styles.suggestionText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 120 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  editProfileLink: { color: colors.gold, fontSize: 12.5, fontWeight: '600', marginTop: 6 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  reminderTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 14.5 },
  reminderCopy: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 16 },
  suggestionRow: { flexDirection: 'row', paddingVertical: 10 },
  suggestionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  suggestionText: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 19 },
  link: { color: colors.gold, fontSize: 12.5, fontWeight: '600' },
  programName: { fontFamily: serif, fontSize: 20, color: colors.textPrimary },
  dayPreviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  dayPreviewText: { color: colors.textSecondary, fontSize: 13.5 },
});
