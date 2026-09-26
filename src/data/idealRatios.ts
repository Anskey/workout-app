import type { MeasurementKey, MuscleGroup, Sex } from '@/types';

/**
 * Heuristic "editorial/runway average" reference tables, expressed as a ratio
 * of the measurement to height, derived from commonly cited fashion/fitness
 * editorial averages at a reference height. These are a heuristic starting
 * point for comparison, not a medical or universal standard — fully editable
 * by the user in Settings.
 */
const FEMALE_REF_HEIGHT_CM = 175;
const FEMALE_REF_CM: Record<Exclude<MeasurementKey, 'weightKg'>, number> = {
  neckCm: 30,
  shouldersCm: 100,
  chestCm: 86,
  waistCm: 61,
  hipsCm: 86,
  bicepCm: 26,
  forearmCm: 22,
  thighCm: 54,
  calfCm: 33,
};

const MALE_REF_HEIGHT_CM = 183;
const MALE_REF_CM: Record<Exclude<MeasurementKey, 'weightKg'>, number> = {
  neckCm: 40,
  shouldersCm: 122,
  chestCm: 102,
  waistCm: 81,
  hipsCm: 97,
  bicepCm: 38,
  forearmCm: 32,
  thighCm: 58,
  calfCm: 38,
};

export function getIdealMeasurements(heightCm: number, sex: Sex): Record<Exclude<MeasurementKey, 'weightKg'>, number> {
  const ref = sex === 'female' ? FEMALE_REF_CM : MALE_REF_CM;
  const refHeight = sex === 'female' ? FEMALE_REF_HEIGHT_CM : MALE_REF_HEIGHT_CM;
  const scale = heightCm / refHeight;
  const out = {} as Record<Exclude<MeasurementKey, 'weightKg'>, number>;
  (Object.keys(ref) as Array<Exclude<MeasurementKey, 'weightKg'>>).forEach((key) => {
    out[key] = Math.round(ref[key] * scale * 10) / 10;
  });
  return out;
}

export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  weightKg: 'Body Weight',
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
export const GROW_TOWARD_IDEAL: Record<Exclude<MeasurementKey, 'weightKg'>, boolean> = {
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
export const MEASUREMENT_TO_MUSCLE: Partial<Record<Exclude<MeasurementKey, 'weightKg'>, MuscleGroup>> = {
  neckCm: 'Neck',
  shouldersCm: 'Shoulders',
  chestCm: 'Chest',
  hipsCm: 'Glutes',
  bicepCm: 'Biceps',
  forearmCm: 'Forearms',
  thighCm: 'Quads',
  calfCm: 'Calves',
};
