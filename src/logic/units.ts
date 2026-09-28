import type { LengthUnit, WeightUnit } from '@/types';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

const round1 = (n: number) => Math.round(n * 10) / 10;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Converts a stored kg value into the number to display in the user's preferred unit. */
export function kgToDisplayValue(kg: number, unit: WeightUnit): number {
  return round1(unit === 'lb' ? kgToLb(kg) : kg);
}

/** Converts a value the user typed (in their preferred unit) into kg for storage. */
export function displayValueToKg(value: number, unit: WeightUnit): number {
  const kg = unit === 'lb' ? lbToKg(value) : value;
  return Math.round(kg * 100) / 100;
}

/** Formats a stored kg value for display, e.g. "60kg" or "132.3lb". */
export function formatWeight(kg: number | undefined, unit: WeightUnit): string {
  if (kg == null) return '—';
  return `${kgToDisplayValue(kg, unit)}${unit}`;
}

export function cmToDisplayLength(cm: number, unit: LengthUnit): number {
  return round1(unit === 'in' ? cm / CM_PER_IN : cm);
}

export function displayLengthToCm(value: number, unit: LengthUnit): number {
  return round1(unit === 'in' ? value * CM_PER_IN : value);
}

export function formatLength(cm: number | undefined, unit: LengthUnit): string {
  if (cm == null) return '—';
  return `${cmToDisplayLength(cm, unit)}${unit}`;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / CM_PER_IN;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return round1((feet * 12 + inches) * CM_PER_IN);
}

export function formatHeight(cm: number, unit: LengthUnit): string {
  if (unit === 'cm') return `${Math.round(cm)} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}′${inches}″`;
}

