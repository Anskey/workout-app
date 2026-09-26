import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  unit?: string;
  placeholder?: string;
}

export function MeasurementField({ label, value, onChangeText, unit = 'cm', placeholder }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder ?? '—'}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 8,
    minWidth: 44,
    textAlign: 'right',
  },
  unit: {
    color: colors.textFaint,
    fontSize: 12,
    marginLeft: 4,
  },
});
