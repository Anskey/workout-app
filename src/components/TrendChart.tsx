import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '@/theme/colors';
import { formatShortDate } from '@/logic/dates';

export interface TrendPoint {
  date: string;
  value: number;
}

interface Props {
  points: TrendPoint[];
  unit: string;
  /** A constant target value, drawn as a dashed reference line — e.g. a goal
   * measurement. Included in the chart's scale even if it falls outside the
   * plotted data, so the line is never clipped off-chart. */
  goalValue?: number;
  /** Whether an increasing value counts as progress — false for measurements like
   * the waist, where moving toward the goal usually means the number going down.
   * Determines whether the trend line reads as teal (improving) or danger
   * (moving away from goal), instead of always treating "up" as good. */
  higherIsBetter?: boolean;
  onPointPress?: (point: TrendPoint) => void;
}

const WIDTH = 280;
const HEIGHT = 90;
const PAD_X = 8;
const PAD_Y = 12;

/** A small trend line for a plain numeric value over time (a body measurement, a
 * target, anything that isn't an exercise's logged set) — same look and tap-to-select
 * interaction as LiftHistoryChart, but unit-agnostic and with an optional goal line. */
export function TrendChart({ points, unit, goalValue, higherIsBetter = true, onPointPress }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>
          {points.length === 0 ? 'Log this a couple of times to see your progress trend.' : 'One more entry and your trend line shows up here.'}
        </Text>
      </View>
    );
  }

  const values = points.map((p) => p.value).concat(goalValue != null ? [goalValue] : []);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const yFor = (v: number) => HEIGHT - PAD_Y - ((v - min) / span) * (HEIGHT - PAD_Y * 2);

  const coords = points.map((p, i) => ({
    x: PAD_X + (points.length === 1 ? 0 : (i / (points.length - 1)) * (WIDTH - PAD_X * 2)),
    y: yFor(p.value),
    value: p.value,
    date: p.date,
  }));

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const first = coords[0];
  const last = coords[coords.length - 1];
  const improving = higherIsBetter ? last.value >= first.value : last.value <= first.value;
  const selected = selectedIdx != null ? coords[selectedIdx] : null;
  const goalY = goalValue != null ? yFor(goalValue) : null;

  return (
    <View>
      <View style={{ width: WIDTH, height: HEIGHT }}>
        <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} stroke={colors.divider} strokeWidth={1} />
          {goalY != null && (
            <Line
              x1={PAD_X}
              y1={goalY}
              x2={WIDTH - PAD_X}
              y2={goalY}
              stroke={colors.navyDeep}
              strokeWidth={1.4}
              strokeDasharray="4,3"
              opacity={0.55}
            />
          )}
          <Polyline
            points={linePoints}
            fill="none"
            stroke={improving ? colors.teal : colors.danger}
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
            {formatShortDate(selected.date)} · {selected.value}
            {unit}
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
          {formatShortDate(first.date)} · {first.value}
          {unit}
        </Text>
        {goalValue != null && (
          <Text style={styles.goalText}>
            Goal · {goalValue}
            {unit}
          </Text>
        )}
        <Text style={[styles.labelText, styles.labelStrong]}>
          {formatShortDate(last.date)} · {last.value}
          {unit}
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
  goalText: { color: colors.navyDeep, fontSize: 11, opacity: 0.7 },
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
