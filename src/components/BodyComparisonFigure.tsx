import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/theme/colors';
import type { MeasurementEntry, MeasurementKey } from '@/types';

type CmMap = Partial<Record<Exclude<MeasurementKey, 'weightKg'>, number>>;

interface Props {
  actual: MeasurementEntry | undefined;
  ideal: CmMap;
}

const WIDTH = 220;
const HEIGHT = 320;
const CENTER_X = WIDTH / 2;
// A circumference measurement is treated as a circle and converted to a schematic
// half-width (circumference / 2π), then scaled to fit the figure — this gives a
// silhouette whose proportions genuinely track the numbers, not an anatomy-accurate
// render.
const PIXELS_PER_CM = 3.1;
const toHalfWidth = (cm: number) => (cm / (2 * Math.PI)) * PIXELS_PER_CM;

// Torso/leg profile points, top to bottom. Each maps to a measurement key.
const PROFILE: { y: number; key: Exclude<MeasurementKey, 'weightKg'>; fallbackCm: number }[] = [
  { y: 58, key: 'neckCm', fallbackCm: 35 },
  { y: 74, key: 'shouldersCm', fallbackCm: 110 },
  { y: 112, key: 'chestCm', fallbackCm: 92 },
  { y: 152, key: 'waistCm', fallbackCm: 70 },
  { y: 178, key: 'hipsCm', fallbackCm: 92 },
  { y: 224, key: 'thighCm', fallbackCm: 56 },
  { y: 272, key: 'calfCm', fallbackCm: 36 },
  { y: 300, key: 'calfCm', fallbackCm: 36 }, // ankle: taper the calf point in a bit further down
];

// `fallback` is the reference map: missing actual measurements fall back to the
// reference number (so an unmeasured region matches the reference outline exactly,
// rather than a generic average that would create a fake-looking gap), and only
// falls back further to PROFILE's generic constant if the reference itself is missing.
function buildPath(source: CmMap | undefined, fallback: CmMap): string {
  const pts = PROFILE.map((p, i) => {
    const cm = source?.[p.key] ?? fallback[p.key] ?? p.fallbackCm;
    const half = i === PROFILE.length - 1 ? toHalfWidth(cm) * 0.55 : toHalfWidth(cm);
    return { y: p.y, half };
  });
  const right = pts.map((p) => `L ${CENTER_X + p.half} ${p.y}`).join(' ');
  const left = [...pts]
    .reverse()
    .map((p) => `L ${CENTER_X - p.half} ${p.y}`)
    .join(' ');
  return `M ${CENTER_X + pts[0].half} ${pts[0].y} ${right} ${left} Z`;
}

/** A tiny paired-circle comparator for a limb measurement that doesn't sit on the
 * main torso profile (bicep, forearm) — actual as a filled circle, reference as a
 * dashed outline, both to the same cm-to-radius scale as the main silhouette. */
function LimbBadge({ actualCm, idealCm, x, y }: { actualCm?: number; idealCm: number; x: number; y: number }) {
  const idealR = toHalfWidth(idealCm) * 0.9;
  const actualR = toHalfWidth(actualCm ?? idealCm) * 0.9;
  return (
    <React.Fragment>
      <Circle cx={x} cy={y} r={idealR} stroke={colors.navyDeep} strokeWidth={1.3} strokeDasharray="3,2.5" fill="none" opacity={0.55} />
      <Circle cx={x} cy={y} r={actualR} fill={colors.gold} fillOpacity={0.4} stroke={colors.gold} strokeWidth={1.6} />
    </React.Fragment>
  );
}

export function BodyComparisonFigure({ actual, ideal }: Props) {
  const actualPath = useMemo(() => buildPath(actual, ideal), [actual, ideal]);
  const idealPath = useMemo(() => buildPath(ideal, ideal), [ideal]);

  const hasAnyData = actual && (Object.keys(ideal) as (keyof CmMap)[]).some((k) => actual[k] != null);

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Circle cx={CENTER_X} cy={32} r={18} fill={colors.surface} stroke={colors.navyDeep} strokeWidth={1.3} opacity={0.5} />
        <Path d={idealPath} stroke={colors.navyDeep} strokeWidth={1.6} strokeDasharray="5,3.5" fill="none" opacity={0.6} />
        <Path d={actualPath} fill={colors.gold} fillOpacity={0.3} stroke={colors.gold} strokeWidth={2.2} />
        <LimbBadge actualCm={actual?.bicepCm} idealCm={ideal.bicepCm ?? 30} x={CENTER_X + 60} y={100} />
        <LimbBadge actualCm={actual?.bicepCm} idealCm={ideal.bicepCm ?? 30} x={CENTER_X - 60} y={100} />
        <LimbBadge actualCm={actual?.forearmCm} idealCm={ideal.forearmCm ?? 25} x={CENTER_X + 66} y={150} />
        <LimbBadge actualCm={actual?.forearmCm} idealCm={ideal.forearmCm ?? 25} x={CENTER_X - 66} y={150} />
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.gold }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.dashSwatch} />
          <Text style={styles.legendText}>Reference</Text>
        </View>
      </View>
      {!hasAnyData && <Text style={styles.hint}>Log a few measurements to fill this in — shown with reference proportions for now.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 6 },
  legendRow: { flexDirection: 'row', gap: 18, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 2 },
  dashSwatch: { width: 12, height: 2, borderRadius: 1, backgroundColor: colors.navyDeep, opacity: 0.6 },
  legendText: { color: colors.textSecondary, fontSize: 12 },
  hint: { color: colors.textFaint, fontSize: 11.5, fontStyle: 'italic', marginTop: 8, textAlign: 'center', paddingHorizontal: 12 },
});
