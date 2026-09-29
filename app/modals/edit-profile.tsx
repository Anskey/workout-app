import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, Pill, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { HeightInput } from '@/components/HeightInput';
import { MeasurementField } from '@/components/MeasurementField';
import { ModalHeader } from '@/components/ModalHeader';
import { useStore } from '@/store/useStore';
import { IDEAL_PRESETS, IDEAL_PRESET_ORDER } from '@/data/idealRatios';
import { compareToIdeal, getLatestMeasurement, getSuggestedGoal } from '@/logic/recommendations';
import { exportData, importData, importDataFromUrl } from '@/logic/dataPortability';
import type { ActivityLevel, Goal, IdealPreset, LengthUnit, Sex, WeightUnit } from '@/types';

const GOALS: { key: Goal; label: string }[] = [
  { key: 'bulk', label: 'Build Muscle' },
  { key: 'cut', label: 'Lose Fat' },
  { key: 'maintain', label: 'Maintain' },
];
const GOAL_LABELS: Record<Goal, string> = { bulk: 'Build Muscle', cut: 'Lose Fat', maintain: 'Maintain' };

const ACTIVITY: { key: ActivityLevel; label: string }[] = [
  { key: 'sedentary', label: 'Sedentary' },
  { key: 'light', label: 'Light' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'active', label: 'Active' },
  { key: 'very_active', label: 'Very Active' },
];

export default function EditProfile() {
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const measurements = useStore((s) => s.measurements);

  const [name, setName] = useState(profile.name);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [sex, setSex] = useState<Sex>(profile.sex);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [goalMode, setGoalMode] = useState<'manual' | 'auto'>(profile.goalMode);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(profile.weightUnit);
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(profile.lengthUnit);
  const [idealPreset, setIdealPreset] = useState<IdealPreset>(profile.idealPreset);
  const [calorieTarget, setCalorieTarget] = useState(profile.calorieTarget ? String(profile.calorieTarget) : '');
  const [proteinTargetG, setProteinTargetG] = useState(profile.proteinTargetG ? String(profile.proteinTargetG) : '');
  const [stepsTarget, setStepsTarget] = useState(profile.stepsTarget ? String(profile.stepsTarget) : '');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importingUrl, setImportingUrl] = useState(false);

  // Live preview of what "Auto" would resolve to, using the in-progress edits above
  // (sex/height/reference), so switching presets updates the suggestion immediately.
  const suggestedGoal = useMemo(() => {
    const latest = getLatestMeasurement(measurements);
    const comparisons = compareToIdeal(latest, { ...profile, sex, heightCm: heightCm || profile.heightCm, idealPreset });
    return getSuggestedGoal(comparisons);
  }, [measurements, profile, sex, heightCm, idealPreset]);

  const onSave = () => {
    const cal = parseFloat(calorieTarget);
    const pro = parseFloat(proteinTargetG);
    const steps = parseFloat(stepsTarget);
    setProfile({
      name,
      heightCm: heightCm || profile.heightCm,
      sex,
      goal: goalMode === 'auto' ? suggestedGoal : goal,
      goalMode,
      activityLevel,
      weightUnit,
      lengthUnit,
      idealPreset,
      calorieTarget: Number.isFinite(cal) ? cal : undefined,
      proteinTargetG: Number.isFinite(pro) ? pro : undefined,
      stepsTarget: Number.isFinite(steps) ? steps : undefined,
    });
    router.back();
  };

  const onExport = async () => {
    setExporting(true);
    const result = await exportData();
    setExporting(false);
    if (!result.ok) Alert.alert('Export failed', result.error ?? 'Something went wrong.');
  };

  const onImport = () => {
    Alert.alert(
      'Import data?',
      'This replaces everything currently in the app (programs, measurements, nutrition and workout logs) with what’s in the chosen file. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose File…',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            const result = await importData();
            setImporting(false);
            if (!result.ok && !result.cancelled) {
              Alert.alert('Import failed', result.error ?? 'Something went wrong.');
            } else if (result.ok) {
              Alert.alert('Import complete', 'Your data has been replaced with the imported backup.');
            }
          },
        },
      ]
    );
  };

  const onImportUrl = () => {
    if (!importUrl.trim()) return;
    Alert.alert(
      'Import data from this link?',
      'This replaces everything currently in the app (programs, measurements, nutrition and workout logs) with what’s at that link. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            setImportingUrl(true);
            const result = await importDataFromUrl(importUrl);
            setImportingUrl(false);
            if (!result.ok) {
              Alert.alert('Import failed', result.error ?? 'Something went wrong.');
            } else {
              Alert.alert('Import complete', 'Your data has been replaced with the imported backup.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Profile & Goals" />

        <Card>
          <SectionHeader>Name</SectionHeader>
          <TextInput value={name} onChangeText={setName} placeholderTextColor={colors.textFaint} style={styles.input} />

          <SectionHeader>Units</SectionHeader>
          <View style={styles.pillRow}>
            {(['kg', 'lb'] as WeightUnit[]).map((u) => (
              <Pill key={u} label={u === 'kg' ? 'Kilograms' : 'Pounds'} active={weightUnit === u} onPress={() => setWeightUnit(u)} />
            ))}
          </View>
          <View style={styles.pillRow}>
            {(['cm', 'in'] as LengthUnit[]).map((u) => (
              <Pill key={u} label={u === 'cm' ? 'Centimetres' : 'Feet / Inches'} active={lengthUnit === u} onPress={() => setLengthUnit(u)} />
            ))}
          </View>

          <SectionHeader>Height</SectionHeader>
          <HeightInput heightCm={heightCm} unit={lengthUnit} onChange={setHeightCm} />

          <SectionHeader>Sex</SectionHeader>
          <View style={styles.pillRow}>
            {(['male', 'female'] as Sex[]).map((s) => (
              <Pill key={s} label={s === 'male' ? 'Male' : 'Female'} active={sex === s} onPress={() => setSex(s)} />
            ))}
          </View>

          <SectionHeader>Goal</SectionHeader>
          <View style={styles.pillRow}>
            <Pill label="Manual" active={goalMode === 'manual'} onPress={() => setGoalMode('manual')} />
            <Pill label="Auto (based on reference)" active={goalMode === 'auto'} onPress={() => setGoalMode('auto')} />
          </View>
          {goalMode === 'manual' ? (
            <View style={styles.pillRow}>
              {GOALS.map((g) => (
                <Pill key={g.key} label={g.label} active={goal === g.key} onPress={() => setGoal(g.key)} />
              ))}
            </View>
          ) : (
            <>
              <SectionHeader>Comparison Reference</SectionHeader>
              <View style={[styles.pillRow, { flexWrap: 'wrap' }]}>
                {IDEAL_PRESET_ORDER.map((p) => (
                  <Pill key={p} label={IDEAL_PRESETS[p].label} active={idealPreset === p} onPress={() => setIdealPreset(p)} />
                ))}
              </View>
              <Text style={styles.presetDescription}>{IDEAL_PRESETS[idealPreset].description}</Text>
              <Text style={styles.presetDescription}>
                Based on your latest measurements vs. {IDEAL_PRESETS[idealPreset].label}, suggested goal: {GOAL_LABELS[suggestedGoal]}.
                This updates automatically as your measurements and reference change.
              </Text>
            </>
          )}

          <SectionHeader>Activity Level</SectionHeader>
          <View style={[styles.pillRow, { flexWrap: 'wrap' }]}>
            {ACTIVITY.map((a) => (
              <Pill key={a.key} label={a.label} active={activityLevel === a.key} onPress={() => setActivityLevel(a.key)} />
            ))}
          </View>

          <SectionHeader>Daily Targets</SectionHeader>
          <Text style={styles.presetDescription}>
            Set your own targets (e.g. from Gemini) to compare against what you actually log each day.
          </Text>
          <MeasurementField label="Calories" unit="kcal" value={calorieTarget} onChangeText={setCalorieTarget} />
          <MeasurementField label="Protein" unit="g" value={proteinTargetG} onChangeText={setProteinTargetG} />
          <MeasurementField label="Steps" unit="steps" value={stepsTarget} onChangeText={setStepsTarget} />
        </Card>

        <Button label="Save" onPress={onSave} style={{ marginTop: 20 }} />
        <Button label="Account & Sync" variant="ghost" onPress={() => router.push('/modals/account')} style={{ marginTop: 14 }} />

        <SectionHeader>Backup</SectionHeader>
        <Text style={styles.backupHint}>
          Export saves everything to a file you can keep or move to another device manually. Import replaces the
          app&rsquo;s current data with a previously exported file.
        </Text>
        {exporting ? (
          <ActivityIndicator color={colors.navyDeep} style={{ marginTop: 10 }} />
        ) : (
          <Button label="Export Data" variant="outline" onPress={onExport} style={{ marginTop: 4 }} />
        )}
        {importing ? (
          <ActivityIndicator color={colors.navyDeep} style={{ marginTop: 10 }} />
        ) : (
          <Button label="Import Data" variant="outline" onPress={onImport} style={{ marginTop: 10 }} />
        )}

        <Text style={[styles.backupHint, { marginTop: 14 }]}>
          If picking a file doesn&rsquo;t work (a known Android issue with some Downloads/cloud-storage apps), paste a
          direct link to a backup file instead:
        </Text>
        <TextInput
          value={importUrl}
          onChangeText={setImportUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="https://…/backup.json"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        {importingUrl ? (
          <ActivityIndicator color={colors.navyDeep} style={{ marginTop: 10 }} />
        ) : (
          <Button label="Import From Link" variant="outline" onPress={onImportUrl} style={{ marginTop: 4 }} />
        )}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  pillRow: { flexDirection: 'row', marginBottom: 10 },
  presetDescription: { color: colors.textFaint, fontSize: 12, lineHeight: 17, marginTop: -2, marginBottom: 4 },
  backupHint: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, marginBottom: 10 },
});
