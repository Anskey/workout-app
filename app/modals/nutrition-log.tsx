import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { MeasurementField } from '@/components/MeasurementField';
import { DateField } from '@/components/DateField';
import { useStore } from '@/store/useStore';
import { todayISODate } from '@/logic/dates';
import { displayValueToKg, kgToDisplayValue } from '@/logic/units';

export default function NutritionLog() {
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const nutritionLogs = useStore((s) => s.nutritionLogs);
  const upsertNutritionLog = useStore((s) => s.upsertNutritionLog);
  const deleteNutritionLog = useStore((s) => s.deleteNutritionLog);
  const weightUnit = useStore((s) => s.profile.weightUnit);

  const existing = useMemo(() => nutritionLogs.find((n) => n.id === entryId), [nutritionLogs, entryId]);
  const [date, setDate] = useState(existing?.date ?? todayISODate());

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
      <FormScrollView contentContainerStyle={styles.scroll}>
          <ModalHeader title="Daily Log" />
          <DateField dateISO={date} onChange={setDate} />

          <Card>
            <SectionHeader>Today</SectionHeader>
            <MeasurementField label="Calories" unit="kcal" value={calories} onChangeText={setCalories} />
            <MeasurementField label="Protein" unit="g" value={proteinG} onChangeText={setProteinG} />
            <MeasurementField label="Weight" unit={weightUnit} value={weight} onChangeText={setWeight} />
          </Card>

          <Button label="Save" onPress={onSave} style={{ marginTop: 20 }} />
          {existing && <Button label="Delete Entry" variant="ghost" onPress={onDelete} style={{ marginTop: 14 }} />}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
});
