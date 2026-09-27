import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { useStore } from '@/store/useStore';
import { formatLongDate, todayISODate } from '@/logic/dates';
import { displayValueToKg, kgToDisplayValue } from '@/logic/units';

export default function NutritionLog() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const nutritionLogs = useStore((s) => s.nutritionLogs);
  const upsertNutritionLog = useStore((s) => s.upsertNutritionLog);
  const deleteNutritionLog = useStore((s) => s.deleteNutritionLog);
  const weightUnit = useStore((s) => s.profile.weightUnit);

  const existing = useMemo(() => nutritionLogs.find((n) => n.id === entryId), [nutritionLogs, entryId]);
  const date = existing?.date ?? todayISODate();

  const [calories, setCalories] = useState(existing?.calories ? String(existing.calories) : '');
  const [proteinG, setProteinG] = useState(existing?.proteinG ? String(existing.proteinG) : '');
  const [weight, setWeight] = useState(existing?.weightKg ? String(kgToDisplayValue(existing.weightKg, weightUnit)) : '');

  const onSave = () => {
    const cal = parseFloat(calories);
    const pro = parseFloat(proteinG);
    const wt = parseFloat(weight);
    upsertNutritionLog({
      id: existing?.id,
      date,
      calories: Number.isFinite(cal) ? cal : undefined,
      proteinG: Number.isFinite(pro) ? pro : undefined,
      weightKg: Number.isFinite(wt) ? displayValueToKg(wt, weightUnit) : undefined,
    });
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete entry?', 'This day’s log will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteNutritionLog(existing.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ModalHeader title="Daily Log" />
          <Text style={styles.dateLabel}>{formatLongDate(date)}</Text>

          <Card>
            <SectionHeader>Today</SectionHeader>
            <MeasurementField label="Calories" unit="kcal" value={calories} onChangeText={setCalories} />
            <MeasurementField label="Protein" unit="g" value={proteinG} onChangeText={setProteinG} />
            <MeasurementField label="Weight" unit={weightUnit} value={weight} onChangeText={setWeight} />
          </Card>

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
