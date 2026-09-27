import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, ScreenTitle, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ComparisonBar } from '@/components/ComparisonBar';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { useStore } from '@/store/useStore';
import { compareToIdeal } from '@/logic/recommendations';
import { todayISODate } from '@/logic/dates';
import type { UserProfile } from '@/types';

export default function Results() {
  const draft = useOnboardingDraft();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const profile: UserProfile = {
    name: draft.name,
    heightCm: draft.heightCm,
    sex: draft.sex,
    goal: draft.goal,
    activityLevel: draft.activityLevel,
    onboardingComplete: false,
    weightUnit: draft.weightUnit,
  };

  const comparisons = compareToIdeal({ id: 'draft', date: todayISODate(), ...draft.measurements }, profile);

  const onFinish = () => {
    completeOnboarding(profile, { date: todayISODate(), ...draft.measurements });
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenTitle subtitle="A heuristic editorial/runway comparison, scaled to your height — a starting point, not a verdict.">
          Your Comparison
        </ScreenTitle>

        {comparisons.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No measurements entered yet — you can always add them later from the Measurements tab.</Text>
          </Card>
        ) : (
          <Card>
            <SectionHeader>vs. Reference</SectionHeader>
            {comparisons.map((c) => (
              <ComparisonBar key={c.key} comparison={c} />
            ))}
          </Card>
        )}

        <Button label="Get Started" onPress={onFinish} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 48 },
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
