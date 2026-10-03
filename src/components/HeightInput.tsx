import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { cmToFeetInches, feetInchesToCm } from '@/logic/units';
import type { LengthUnit } from '@/types';

interface Props {
  heightCm: number;
  onChange: (cm: number) => void;
}

const digits = (t: string) => t.replace(/[^0-9]/g, '');

// Separate components per unit so switching units remounts with fresh text derived from heightCm.
export function HeightInput({ unit, ...props }: Props & { unit: LengthUnit }) {
  return unit === 'cm' ? <CentimetreInput {...props} /> : <FeetInchesInput {...props} />;
}

function CentimetreInput({ heightCm, onChange }: Props) {
  const [text, setText] = useState(heightCm ? String(Math.round(heightCm)) : '');
  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={(t) => {
          const clean = digits(t);
          setText(clean);
          if (Number(clean) > 0) onChange(Number(clean));
        }}
        keyboardType="number-pad"
        style={[styles.input, { flex: 1 }]}
      />
      <Text style={styles.unit}>cm</Text>
    </View>
  );
}

function FeetInchesInput({ heightCm, onChange }: Props) {
  const initial = cmToFeetInches(heightCm);
  const [ft, setFt] = useState(heightCm ? String(initial.feet) : '');
  const [inches, setInches] = useState(heightCm ? String(initial.inches) : '');

  const update = (nextFt: string, nextIn: string) => {
    const f = Number(nextFt) || 0;
    const i = Number(nextIn) || 0;
    if (f > 0 || i > 0) onChange(feetInchesToCm(f, i));
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={ft}
        onChangeText={(t) => {
          const clean = digits(t);
          setFt(clean);
          update(clean, inches);
        }}
        keyboardType="number-pad"
        style={[styles.input, { flex: 1 }]}
      />
      <Text style={styles.unit}>ft</Text>
      <TextInput
        value={inches}
        onChangeText={(t) => {
          const clean = digits(t);
          setInches(clean);
          update(ft, clean);
        }}
        keyboardType="number-pad"
        style={[styles.input, { flex: 1 }]}
      />
      <Text style={styles.unit}>in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  input: {
    minWidth: 0,
    color: colors.textPrimary,
    fontSize: 16,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unit: { color: colors.textFaint, fontSize: 13 },
});
