/** Pulls calories/protein/weight/steps out of loose free-text (e.g. a daily summary
 * shared from another app like Gemini) — tolerant of whatever order/wording it uses,
 * since we don't control that text's format. Weight is normalized to kg regardless of
 * which unit the source text used, so the caller can convert to whatever the user's
 * own display unit is. */
export interface ParsedNutrition {
  calories?: number;
  proteinG?: number;
  weightKg?: number;
  steps?: number;
}

function firstMatch(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ''));
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export function parseSharedNutritionText(text: string): ParsedNutrition {
  const calories = firstMatch(text, [
    /calor(?:ies)?\s*[:\-]?\s*([\d,]+(?:\.\d+)?)/i,
    /([\d,]+(?:\.\d+)?)\s*k?cal/i,
  ]);

  const proteinG = firstMatch(text, [
    /protein\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*g?/i,
    /([\d,]+(?:\.\d+)?)\s*g\s*protein/i,
  ]);

  const steps = firstMatch(text, [
    /steps?\s*[:\-]?\s*([\d,]+)/i,
    /([\d,]+)\s*steps/i,
  ]);

  const lb = firstMatch(text, [
    /weight\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i,
    /([\d,]+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i,
  ]);
  const kg = firstMatch(text, [
    /weight\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\s*kgs?\b/i,
    /([\d,]+(?:\.\d+)?)\s*kgs?\b/i,
  ]);
  // A bare "Weight: 157.2" with no unit — assume lb, the more common default for this app's users.
  const bareWeight =
    lb == null && kg == null
      ? firstMatch(text, [/weight\s*[:\-]?\s*([\d,]+(?:\.\d+)?)\b/i])
      : undefined;

  const weightKg = kg ?? (lb != null ? lb / 2.20462 : bareWeight != null ? bareWeight / 2.20462 : undefined);

  return {
    calories,
    proteinG,
    steps,
    weightKg: weightKg != null ? Math.round(weightKg * 100) / 100 : undefined,
  };
}
