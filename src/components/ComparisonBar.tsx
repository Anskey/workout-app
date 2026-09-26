import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { MeasurementComparison } from '@/logic/recommendations';

const STATUS_COLOR: Record<MeasurementComparison['status'], string> = {
  lagging: colors.danger,
  onTarget: colors.teal,
  exceeds: colors.gold,
};

export function ComparisonBar({ comparison }: { comparison: MeasurementComparison }) {
  const { label, actual, ideal, diffPct, status } = comparison;
  const color = STATUS_COLOR[status];
  const ratio = Math.max(0.1, Math.min(1.6, actual / ideal));
  const pct = Math.min(100, (ratio / 1.6) * 100);
  const idealPct = Math.min(100, (1 / 1.6) * 100);

  // Factual direction (below/above the reference number) is independent of
  // whether that direction is flattering — status/color already conveys that.
  const directionLabel = status === 'onTarget' ? 'On reference' : diffPct < 0 ? 'Below reference' : 'Above reference';

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, { color }]}>{directionLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={[styles.idealMarker, { left: `${idealPct}%` }]} />
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {actual} cm · reference {ideal} cm ({diffPct > 0 ? '+' : ''}
          {diffPct.toFixed(0)}%)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: colors.textPrimary, fontSize: 14.5, fontWeight: '600' },
  status: { fontSize: 12, fontWeight: '600' },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(47,102,144,0.10)',
    overflow: 'visible',
    justifyContent: 'center',
  },
  fill: { height: 8, borderRadius: 4, position: 'absolute', left: 0 },
  idealMarker: {
    position: 'absolute',
    width: 2,
    height: 14,
    top: -3,
    backgroundColor: colors.navyDeep,
    opacity: 0.6,
    borderRadius: 1,
  },
  footerRow: { marginTop: 5 },
  footerText: { color: colors.textFaint, fontSize: 11.5 },
});
