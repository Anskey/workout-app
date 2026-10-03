/** Different names for the same exercise, mapped to the one name the app uses (the spelling
 * your program uses). Applied wherever a name is looked up — the library, notes, form cues and
 * lift history — so older logs and saved programs under an alias still land on the right
 * exercise. "Bottom-Half" versions are deliberately separate exercises and are not merged. */
export const EXERCISE_ALIASES: Record<string, string> = {
  // Machine / dumbbell chest presses
  'Flat Chest Press Machine': 'Flat Machine Chest Press',
  'Machine Chest Press': 'Flat Machine Chest Press',
  'Machine Bench Press': 'Flat Machine Chest Press',
  'Incline Chest Press Machine': 'Incline Machine Chest Press',
  'Chest Press Machine Incline': 'Incline Machine Chest Press',
  'Bottom-Half Incline Chest Press Machine': 'Bottom-Half Incline Machine Chest Press',
  'Flat Dumbbell Chest Press': 'Flat DB Bench Press',
  'Incline Dumbbell Chest Press': 'Incline DB Press',

  // Back
  'Incline Chest-Supported DB Row': 'Chest-Supported Incline DB Row',
  'DB Pullover': 'DB Lat Pullover',
  'Cable Unilateral Face Pull': 'Cable 1-Arm Face Pull',

  // Arms and core
  'Weighted Decline Crunch': 'Decline Weighted Crunch',
  'Reverse Grip EZ-Bar Curl': 'Reverse-Grip EZ-Bar Curl',
  'Bar Cable Triceps Pressdown': 'Bar Triceps Pressdown',
  'Rope Cable Triceps Pressdown': 'Rope Triceps Pressdown',
  'DB Kickback': 'DB Triceps Kickback',

  // Legs
  'Nordic Curl': 'Nordic Ham Curl',
  'Bulgarian Split Squat': 'DB Bulgarian Split Squat',

  // Names that aren't in the program, mapped to the program's own name for that exercise
  'Bottom-Half Cable Flye': 'Bottom-Half Seated Cable Flye',
  'Overhead Cable Shoulder Press': 'Cable Shoulder Press',

  // Older "Name (Variant)" spellings
  'Triceps Extension (Bar)': 'Bar Triceps Extension',
  'Triceps Extension (Rope)': 'Rope Triceps Extension',
  'Triceps Pressdown (Bar)': 'Bar Triceps Pressdown',
  'Triceps Pressdown (Rope)': 'Rope Triceps Pressdown',
  'Cable Triceps Pressdown (Bar)': 'Bar Triceps Pressdown',
  'Cable Triceps Pressdown (Rope)': 'Rope Triceps Pressdown',
  'Diverging Pressdown (Rope)': 'Rope Diverging Pressdown',
  'Close-Grip Pushup (AMRAP)': 'Close-Grip Pushup',
  'Bar Triceps Extension': 'Bar Overhead Cable Triceps Extension',
  'Rope Triceps Extension': 'Rope Overhead Cable Triceps Extension',
  'Rope Diverging Pressdown': 'Triceps Diverging Pressdown',
  'DB Skull Crusher (Bottom-Half)': 'Bottom-Half DB Skull Crusher',
  'DB Lateral Raise (Bottom-Half)': 'Bottom-Half DB Lateral Raise',
  'Good Morning (Light Weight)': 'Light-Weight Good Morning',
};

const BY_LOWER = new Map(Object.entries(EXERCISE_ALIASES).map(([alias, name]) => [alias.trim().toLowerCase(), name]));

/** The app's single name for an exercise (the name itself if it has no alias). */
export function canonicalExerciseName(name: string): string {
  return BY_LOWER.get(name.trim().toLowerCase()) ?? name.trim();
}
