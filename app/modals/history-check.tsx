import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Badge, Pill, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { ChevronRightIcon } from '@/components/Icons';
import { useStore } from '@/store/useStore';
import { findWeightJumps } from '@/logic/historyCheck';
import { formatShortDate } from '@/logic/dates';
import { kgToDisplayValue } from '@/logic/units';

const THRESHOLDS = [25, 40, 60];

/** Lists logged lifts whose weight changes sharply from one session to the next, so wrongly
 * logged entries (a typo, or sets saved under the wrong exercise) are easy to find and fix. */
export default function HistoryCheck() {
  const sessionLogs = useStore((s) => s.sessionLogs);
  const unit = useStore((s) => s.profile.weightUnit);
  const [threshold, setThreshold] = useState(40);

  const flags = useMemo(() => findWeightJumps(sessionLogs, threshold), [sessionLogs, threshold]);
  const w = (kg: number) => `${kgToDisplayValue(kg, unit)}${unit}`;

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Check Weights" />
        <Text style={styles.intro}>
          Flags logged exercises where the weight changes sharply between sessions. A <Text style={styles.bold}>spike</Text> is
          out of line with the sessions on both sides, so it&rsquo;s most likely a typo or sets saved under the wrong exercise.
          A <Text style={styles.bold}>big jump</Text> is a change that stuck, which may be real. Tap one to open that day&rsquo;s
          log and fix it.
        </Text>

        <SectionHeader>Flag changes of at least</SectionHeader>
        <View style={styles.pillRow}>
          {THRESHOLDS.map((t) => (
            <Pill key={t} label={`${t}%`} active={threshold === t} onPress={() => setThreshold(t)} />
          ))}
        </View>

        <SectionHeader>{flags.length === 1 ? '1 entry to check' : `${flags.length} entries to check`}</SectionHeader>
        {flags.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              {sessionLogs.length === 0
                ? 'No workouts logged yet.'
                : `Nothing found at ${threshold}%. Try a lower number to be stricter.`}
            </Text>
          </Card>
        ) : (
          flags.map((f) => (
            <Pressable
              key={`${f.logId}-${f.exerciseName}`}
              onPress={() => router.push({ pathname: '/modals/session-log', params: { programId: f.programId, dayId: f.dayId, date: f.date } })}
              style={{ marginBottom: 12 }}
            >
              <Card>
                <View style={styles.headRow}>
                  <Badge label={f.kind === 'spike' ? 'Spike' : 'Big jump'} color={f.kind === 'spike' ? colors.danger : colors.gold} />
                  <Text style={styles.name} numberOfLines={2}>
                    {f.exerciseName}
                  </Text>
                  <ChevronRightIcon color={colors.textFaint} />
                </View>
                <Text style={styles.line}>
                  <Text style={styles.bold}>{formatShortDate(f.date)}</Text> · {w(f.weightKg)} —{' '}
                  {f.weightKg > f.prevKg ? 'up' : 'down'} {f.changePct}% from {w(f.prevKg)} on {formatShortDate(f.prevDate)}
                </Text>
                {f.nextKg != null && f.nextDate && (
                  <Text style={styles.next}>
                    Next time: {w(f.nextKg)} on {formatShortDate(f.nextDate)}
                  </Text>
                )}
              </Card>
            </Pressable>
          ))
        )}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 60 },
  intro: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: -8, marginBottom: 18 },
  bold: { fontWeight: '700', color: colors.textPrimary },
  pillRow: { flexDirection: 'row', marginBottom: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  name: { flex: 1, color: colors.textPrimary, fontSize: 15.5, fontWeight: '700' },
  line: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 19 },
  next: { color: colors.textFaint, fontSize: 12.5, marginTop: 4 },
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
