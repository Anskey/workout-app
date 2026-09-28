import type { IdealPreset, MeasurementKey, MuscleGroup, Sex } from '@/types';

/**
 * Heuristic reference tables, expressed as measurements at a reference height,
 * for a few commonly-referenced body-proportion archetypes. These are a
 * heuristic starting point for comparison, not a medical or universal
 * standard — pick whichever (if any) matches what you're training toward.
 */
interface PresetTable {
  label: string;
  description: string;
  femaleRefHeightCm: number;
  femaleRefCm: Record<MeasurementKey, number>;
  maleRefHeightCm: number;
  maleRefCm: Record<MeasurementKey, number>;
}

export const IDEAL_PRESETS: Record<IdealPreset, PresetTable> = {
  editorial: {
    label: 'Editorial / Fashion',
    description: 'Lean, proportional editorial-average build.',
    femaleRefHeightCm: 175,
    femaleRefCm: { neckCm: 30, shouldersCm: 100, chestCm: 86, waistCm: 61, hipsCm: 86, bicepCm: 26, forearmCm: 22, thighCm: 54, calfCm: 33 },
    maleRefHeightCm: 183,
    maleRefCm: { neckCm: 40, shouldersCm: 122, chestCm: 102, waistCm: 81, hipsCm: 97, bicepCm: 38, forearmCm: 32, thighCm: 58, calfCm: 38 },
  },
  couture: {
    label: 'Couture / Runway',
    description: 'Tall, lean, straight "sample size" runway proportions — narrower through the waist and hips than editorial.',
    femaleRefHeightCm: 175,
    femaleRefCm: { neckCm: 29, shouldersCm: 97, chestCm: 81, waistCm: 58, hipsCm: 82, bicepCm: 24, forearmCm: 21, thighCm: 50, calfCm: 31 },
    maleRefHeightCm: 183,
    maleRefCm: { neckCm: 37, shouldersCm: 112, chestCm: 92, waistCm: 76, hipsCm: 90, bicepCm: 33, forearmCm: 29, thighCm: 53, calfCm: 35 },
  },
  athletic: {
    label: 'Athletic / Fitness Model',
    description: 'Broader shoulders and visible, moderate muscle — a fit, athletic look rather than maximum size.',
    femaleRefHeightCm: 175,
    femaleRefCm: { neckCm: 31, shouldersCm: 104, chestCm: 88, waistCm: 60, hipsCm: 88, bicepCm: 28, forearmCm: 23, thighCm: 56, calfCm: 35 },
    maleRefHeightCm: 183,
    maleRefCm: { neckCm: 41, shouldersCm: 127, chestCm: 106, waistCm: 78, hipsCm: 98, bicepCm: 40, forearmCm: 33, thighCm: 61, calfCm: 40 },
  },
  bodybuilding: {
    label: 'Bodybuilding Aesthetic',
    description: 'Classic "golden ratio" physique — the most muscle and the biggest shoulder/waist taper of the presets.',
    femaleRefHeightCm: 175,
    femaleRefCm: { neckCm: 32, shouldersCm: 106, chestCm: 89, waistCm: 58, hipsCm: 90, bicepCm: 30, forearmCm: 24, thighCm: 58, calfCm: 36 },
    maleRefHeightCm: 183,
    maleRefCm: { neckCm: 44, shouldersCm: 132, chestCm: 112, waistCm: 76, hipsCm: 98, bicepCm: 44, forearmCm: 35, thighCm: 65, calfCm: 42 },
  },
};

export const IDEAL_PRESET_ORDER: IdealPreset[] = ['editorial', 'couture', 'athletic', 'bodybuilding'];

export function getIdealMeasurements(
  heightCm: number,
  sex: Sex,
  preset: IdealPreset = 'editorial'
): Record<MeasurementKey, number> {
  const table = IDEAL_PRESETS[preset] ?? IDEAL_PRESETS.editorial;
  const ref = sex === 'female' ? table.femaleRefCm : table.maleRefCm;
  const refHeight = sex === 'female' ? table.femaleRefHeightCm : table.maleRefHeightCm;
  const scale = heightCm / refHeight;
  const out = {} as Record<MeasurementKey, number>;
  (Object.keys(ref) as MeasurementKey[]).forEach((key) => {
    out[key] = Math.round(ref[key] * scale * 10) / 10;
  });
  return out;
}

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  neckCm: 'Neck',
  shouldersCm: 'Shoulders',
  chestCm: 'Chest / Bust',
  waistCm: 'Waist',
  hipsCm: 'Hips',
  bicepCm: 'Bicep (flexed)',
  forearmCm: 'Forearm',
  thighCm: 'Thigh',
  calfCm: 'Calf',
};

// Whether "bigger than reference" is the desirable direction for this measurement.
// Waist is the one measurement where smaller-than-reference is the flattering direction.
export const GROW_TOWARD_IDEAL: Record<MeasurementKey, boolean> = {
  neckCm: true,
  shouldersCm: true,
  chestCm: true,
  waistCm: false,
  hipsCm: true,
  bicepCm: true,
  forearmCm: true,
  thighCm: true,
  calfCm: true,
};

// Maps a measurement to the trainable muscle group it corresponds to, for
// tying measurement gaps back into workout-program suggestions.
export const MEASUREMENT_TO_MUSCLE: Partial<Record<MeasurementKey, MuscleGroup>> = {
  neckCm: 'Neck',
  shouldersCm: 'Shoulders',
  chestCm: 'Chest',
  hipsCm: 'Glutes',
  bicepCm: 'Biceps',
  forearmCm: 'Forearms',
  thighCm: 'Quads',
  calfCm: 'Calves',
};
