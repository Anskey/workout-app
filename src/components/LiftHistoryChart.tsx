import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { formatShortDate } from '@/logic/dates';
import { kgToDisplayValue } from '@/logic/units';
import type { HistoryPoint } from '@/logic/sessionHistory';
import type { WeightUnit } from '@/types';

interface Props {
  points: HistoryPoint[];
  weightUnit: WeightUnit;
  onPointPress?: (point: HistoryPoint) => void;
}

const WIDTH = 280;
const HEIGHT = 90;
const PAD_X = 8;
const PAD_Y = 12;

/** A small trend line of an exercise's best set (weight) across every past logged session. */
export function LiftHistoryChart({ points, weightUnit, onPointPress }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>
          {points.length === 0
            ? 'Log this exercise a couple of times to see your progress trend.'
            : 'One more logged session and your trend line shows up here.'}
        </Text>
      </View>
    );
  }

  const weights = points.map((p) => kgToDisplayValue(p.topSet.weightKg ?? 0, weightUnit));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const w = kgToDisplayValue(p.topSet.weightKg ?? 0, weightUnit);
    const x = PAD_X + (points.length === 1 ? 0 : (i / (points.length - 1)) * (WIDTH - PAD_X * 2));
    const y = HEIGHT - PAD_Y - ((w - min) / span) * (HEIGHT - PAD_Y * 2);
    return { x, y, w, reps: p.topSet.reps, partialReps: p.topSet.partialReps, date: p.date };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const first = coords[0];
  const last = coords[coords.length - 1];
  const trendUp = last.w >= first.w;
  const selected = selectedIdx != null ? coords[selectedIdx] : null;

  return (
    <View>
      <View style={{ width: WIDTH, height: HEIGHT }}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} stroke={colors.divider} strokeWidth={1} />
          <Polyline
            points={linePoints}
            fill="none"
            stroke={trendUp ? colors.teal : colors.danger}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {coords.map((c, i) => (
            <Circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={selectedIdx === i ? 5 : i === coords.length - 1 ? 4 : 2.5}
              fill={selectedIdx === i ? colors.teal : i === coords.length - 1 ? colors.gold : colors.navy}
            />
          ))}
        </Svg>
        {coords.map((c, i) => (
          <Pressable
            key={i}
            hitSlop={6}
            onPress={() => setSelectedIdx(i)}
            style={[styles.pointHit, { left: c.x - 11, top: c.y - 11 }]}
          />
        ))}
      </View>
      {selected && (
        <View style={styles.selectedRow}>
          <Text style={styles.selectedText}>
            {formatShortDate(selected.date)} · {selected.w}
            {weightUnit}
            {selected.reps != null ? ` × ${selected.reps}${selected.partialReps ? `+${selected.partialReps}` : ''}` : ''}
          </Text>
          {onPointPress && (
            <Text style={styles.editLink} onPress={() => onPointPress(points[selectedIdx!])}>
              Edit →
            </Text>
          )}
        </View>
      )}
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>
          {formatShortDate(first.date)} · {first.w}
          {weightUnit}
          {first.reps != null ? ` × ${first.reps}${first.partialReps ? `+${first.partialReps}` : ''}` : ''}
        </Text>
        <Text style={[styles.labelText, styles.labelStrong]}>
          {formatShortDate(last.date)} · {last.w}
          {weightUnit}
          {last.reps != null ? ` × ${last.reps}${last.partialReps ? `+${last.partialReps}` : ''}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: { paddingVertical: 18 },
  emptyText: { color: colors.textFaint, fontSize: 12.5, fontStyle: 'italic' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  labelText: { color: colors.textFaint, fontSize: 11 },
  labelStrong: { color: colors.gold, fontWeight: '700' },
  pointHit: { position: 'absolute', width: 22, height: 22 },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  selectedText: { color: colors.textPrimary, fontSize: 12.5, fontWeight: '700' },
  editLink: { color: colors.gold, fontSize: 12.5, fontWeight: '700' },
});
