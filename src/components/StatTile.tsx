import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export function StatTile({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : null]}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1 },
  label: { color: colors.textFaint, fontSize: 11.5, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  unit: { fontSize: 12, color: colors.textFaint, fontWeight: '400' },
});
