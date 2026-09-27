import type { WeightUnit } from '@/types';

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Converts a stored kg value into the number to display in the user's preferred unit. */
export function kgToDisplayValue(kg: number, unit: WeightUnit): number {
  const value = unit === 'lb' ? kgToLb(kg) : kg;
  return Math.round(value * 10) / 10;
}

/** Converts a value the user typed (in their preferred unit) into kg for storage. */
export function displayValueToKg(value: number, unit: WeightUnit): number {
  const kg = unit === 'lb' ? lbToKg(value) : value;
  return Math.round(kg * 100) / 100;
}

/** Formats a stored kg value for display, e.g. "60 kg" or "132.3 lb". */
export function formatWeight(kg: number | undefined, unit: WeightUnit): string {
  if (kg == null) return '—';
  return `${kgToDisplayValue(kg, unit)}${unit}`;
}
