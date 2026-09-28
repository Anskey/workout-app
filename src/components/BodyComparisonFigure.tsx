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

const WIDTH = 240;
const HEIGHT = 340;
const CENTER_X = WIDTH / 2;
// A circumference measurement is treated as a circle and converted to a schematic
// half-width (circumference / 2π), then scaled to fit the figure — this gives a
// silhouette whose proportions genuinely track the numbers, not an anatomy-accurate
// render.
const PIXELS_PER_CM = 3.1;
const toHalfWidth = (cm: number) => (cm / (2 * Math.PI)) * PIXELS_PER_CM;

type Key = Exclude<MeasurementKey, 'weightKg'>;
const cmFor = (key: Key, fallbackCm: number, source: CmMap | undefined, fallback: CmMap) =>
  source?.[key] ?? fallback[key] ?? fallbackCm;

/** Turns an ordered ring of points into a smooth closed curve (Catmull-Rom -> cubic
 * Bezier), so each body part reads as a rounded limb/torso instead of a straight-edged
 * polygon. Wraps around the ends since the ring has no start/end seam. */
function smoothClosedPath(points: { x: number; y: number }[]): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n];
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return `${d} Z`;
}

/** A closed tapered "tube" (one path per point, mirrored around a fixed local
 * centerline) — used for the torso and, offset to each side, for each leg and arm. */
function tubePath(centerX: number, points: { y: number; half: number }[]): string {
  const right = points.map((p) => ({ x: centerX + p.half, y: p.y }));
  const left = [...points].reverse().map((p) => ({ x: centerX - p.half, y: p.y }));
  return smoothClosedPath([...right, ...left]);
}

const TORSO_PROFILE: { y: number; key: Key; fallbackCm: number }[] = [
  { y: 54, key: 'neckCm', fallbackCm: 35 },
  { y: 74, key: 'shouldersCm', fallbackCm: 110 },
  { y: 108, key: 'chestCm', fallbackCm: 92 },
  { y: 146, key: 'waistCm', fallbackCm: 70 },
  { y: 176, key: 'hipsCm', fallbackCm: 92 },
];

const HEAD_CY = 28;
const HEAD_R = 16;

const LEG_PROFILE = [
  { y: 176, key: 'hipsCm' as Key, fallbackCm: 92, factor: 0.34 }, // starts fused to the hip line, no gap
  { y: 200, key: 'thighCm' as Key, fallbackCm: 56, factor: 1 },
  { y: 250, key: 'thighCm' as Key, fallbackCm: 56, factor: 0.55 },
  { y: 278, key: 'calfCm' as Key, fallbackCm: 36, factor: 1 },
  { y: 302, key: 'calfCm' as Key, fallbackCm: 36, factor: 0.45 },
  { y: 312, key: 'calfCm' as Key, fallbackCm: 36, factor: 0.5 }, // small heel/foot flare
];

// Starts fused to the shoulder line (same y, overlapping half-width) so the deltoid
// reads as a continuation of the torso, then immediately pinches in for a concave
// "armpit" notch — without it the arm and torso just blend into one convex blob —
// before flaring out to the bicep peak and tapering down to the wrist as one limb.
const ARM_PROFILE = [
  { y: 78, key: 'shouldersCm' as Key, fallbackCm: 110, factor: 0.22 },
  { y: 92, key: 'bicepCm' as Key, fallbackCm: 30, factor: 0.6 },
  { y: 114, key: 'bicepCm' as Key, fallbackCm: 30, factor: 1.05 },
  { y: 142, key: 'bicepCm' as Key, fallbackCm: 30, factor: 0.95 },
  { y: 160, key: 'forearmCm' as Key, fallbackCm: 25, factor: 1 },
  { y: 176, key: 'forearmCm' as Key, fallbackCm: 25, factor: 0.5 },
];

interface FigurePaths {
  neck: string;
  torso: string;
  legL: string;
  legR: string;
  armL: string;
  armR: string;
}

function buildFigure(source: CmMap | undefined, fallback: CmMap): FigurePaths {
  const torsoPts = TORSO_PROFILE.map((p) => ({ y: p.y, half: toHalfWidth(cmFor(p.key, p.fallbackCm, source, fallback)) }));
  const torso = tubePath(CENTER_X, torsoPts);

  // Bridges the head circle to the torso's neck point — without it the head just
  // floats disconnected above the shoulders.
  const neck = tubePath(CENTER_X, [{ y: HEAD_CY + HEAD_R * 0.7, half: HEAD_R * 0.72 }, torsoPts[0]]);

  const hipHalf = torsoPts[torsoPts.length - 1].half;
  const shoulderHalf = torsoPts[1].half;

  const legPts = LEG_PROFILE.map((p) => ({ y: p.y, half: toHalfWidth(cmFor(p.key, p.fallbackCm, source, fallback)) * p.factor }));
  const armPts = ARM_PROFILE.map((p) => ({ y: p.y, half: toHalfWidth(cmFor(p.key, p.fallbackCm, source, fallback)) * p.factor }));

  // Each limb tube is centered so its first (topmost) point sits fused against the
  // torso's shoulder/hip edge — the inner half overlaps and hides under the torso
  // (drawn last), the outer half becomes the visible deltoid/hip-to-thigh curve —
  // instead of floating beside the torso with a visible gap.
  const legOffset = hipHalf * 0.68;
  const armOffset = shoulderHalf * 1.02;

  return {
    neck,
    torso,
    legL: tubePath(CENTER_X - legOffset, legPts),
    legR: tubePath(CENTER_X + legOffset, legPts),
    armL: tubePath(CENTER_X - armOffset, armPts),
    armR: tubePath(CENTER_X + armOffset, armPts),
  };
}

function FigureLayer({ paths, variant }: { paths: FigurePaths; variant: 'actual' | 'ideal' }) {
  const props =
    variant === 'actual'
      ? { fill: colors.gold, fillOpacity: 1, stroke: colors.gold, strokeWidth: 2.2 }
      : { fill: 'none', stroke: colors.navyDeep, strokeWidth: 1.6, strokeDasharray: '5,3.5', opacity: 0.6 };
  return (
    <React.Fragment>
      <Path d={paths.armL} {...props} />
      <Path d={paths.armR} {...props} />
      <Path d={paths.legL} {...props} />
      <Path d={paths.legR} {...props} />
      <Path d={paths.neck} {...props} />
      <Path d={paths.torso} {...props} />
    </React.Fragment>
  );
}

export function BodyComparisonFigure({ actual, ideal }: Props) {
  const actualFigure = useMemo(() => buildFigure(actual, ideal), [actual, ideal]);
  const idealFigure = useMemo(() => buildFigure(ideal, ideal), [ideal]);

  const hasAnyData = actual && (Object.keys(ideal) as (keyof CmMap)[]).some((k) => actual[k] != null);

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <FigureLayer paths={idealFigure} variant="ideal" />
        <FigureLayer paths={actualFigure} variant="actual" />
        <Circle cx={CENTER_X} cy={HEAD_CY} r={HEAD_R} fill={colors.surface} stroke={colors.navyDeep} strokeWidth={1.3} opacity={0.9} />
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
