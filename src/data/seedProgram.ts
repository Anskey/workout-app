import type { Exercise, WorkoutDay, WorkoutProgram } from '@/types';

let counter = 0;
function ex(partial: Omit<Exercise, 'id'>): Exercise {
  counter += 1;
  return { id: `seed-ex-${counter}`, ...partial };
}

function weakSlot(n: 1 | 2): Exercise {
  return ex({
    name: `Weak Point Exercise #${n} (optional)`,
    muscleGroups: ['Weak Point'],
    warmupSets: '1-3',
    workingSets: '2',
    reps: '8-12',
    earlyRPE: '~7-8',
    lastRPE: '~9',
    rest: '~1-3 min',
    isWeakPointSlot: true,
    substitutions: ['Pick a lagging body part from the Weak Points table and choose an exercise for it.'],
  });
}

/**
 * Seed data extracted from the user's own "Pure Bodybuilding Program - Phase 2"
 * PDF (Week 1 / intro-deload week prescriptions). This is a Push/Pull/Legs +
 * Arms split run across an 8-workout cycle. Numbers and exercise names were
 * parsed from the PDF's table layout — double check against the source PDF
 * and adjust freely; everything here is fully editable in the app.
 */
function buildDays(): WorkoutDay[] {
  const pull1: WorkoutDay = {
    id: 'seed-day-pull1',
    name: 'Pull #1',
    exercises: [
      ex({
        name: 'Wide-Grip Pull-Up',
        muscleGroups: ['Back Width'],
        warmupSets: '2-3', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Wide-Grip Machine Pulldown', 'Wide-Grip Lat Pulldown'],
      }),
      ex({
        name: 'Chest-Supported Machine Row',
        muscleGroups: ['Back Thickness'],
        warmupSets: '2', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Chest-Supported T-Bar Row', 'Chest-Supported Incline DB Row'],
      }),
      ex({
        name: 'Half-Kneeling 1-Arm Lat Pulldown',
        muscleGroups: ['Back Width'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Straight-Bar Lat Pulldown', 'DB Lat Pullover'],
      }),
      ex({
        name: 'Cable 1-Arm Face Pull',
        muscleGroups: ['Rear Delts'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Rope Face Pull', 'Bent-Over Reverse DB Flye'],
      }),
      ex({
        name: 'Seated Bayesian High Cable Curl',
        muscleGroups: ['Biceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Incline DB Stretch Curl', 'Bayesian Cable Curl'],
      }),
      ex({
        name: 'Cable Crunch',
        muscleGroups: ['Abs'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Weighted Decline Crunch', 'Weighted Crunch'],
      }),
    ],
  };

  const push1: WorkoutDay = {
    id: 'seed-day-push1',
    name: 'Push #1',
    exercises: [
      ex({
        name: 'DB Lateral Raise',
        muscleGroups: ['Shoulders'],
        warmupSets: '1', workingSets: '3', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Cuffed Behind-The-Back Lateral Raise'],
      }),
      ex({
        name: 'Flat Machine Chest Press',
        muscleGroups: ['Chest'],
        warmupSets: '2-3', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~9', rest: '~3-5 min',
        substitutions: ['Flat DB Bench Press', 'Barbell Bench Press'],
      }),
      ex({
        name: 'Bottom-Half Cable Flye',
        muscleGroups: ['Chest'],
        warmupSets: '2', workingSets: '2', reps: '8-10', earlyRPE: '~7-8', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Bottom-Half DB Flye', 'Bottom-Half Pec Deck'],
      }),
      ex({
        name: 'Seated DB Shoulder Press',
        muscleGroups: ['Shoulders'],
        warmupSets: '2', workingSets: '2', reps: '10-12', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Machine Shoulder Press', 'Seated Smith Machine Shoulder Press'],
      }),
      ex({
        name: 'Triceps Extension (Bar)',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Triceps Extension (Rope)', 'DB Skull Crusher'],
      }),
      ex({
        name: 'Cable Triceps Kickback',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '15-20', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['DB Triceps Kickback', 'Cable Skull Crusher'],
      }),
    ],
  };

  const legs1: WorkoutDay = {
    id: 'seed-day-legs1',
    name: 'Legs #1',
    exercises: [
      ex({
        name: 'Seated Leg Curl',
        muscleGroups: ['Hamstrings'],
        warmupSets: '1-2', workingSets: '2', reps: '8-10', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Lying Leg Curl', 'Nordic Ham Curl'],
      }),
      ex({
        name: 'Smith Machine Squat',
        muscleGroups: ['Quads'],
        warmupSets: '2-4', workingSets: '2', reps: '6-8', earlyRPE: '~7', lastRPE: '~8', rest: '~3-5 min',
        substitutions: ['Bulgarian Split Squat', 'High-Bar Back Squat'],
      }),
      ex({
        name: 'Glute-Ham Raise',
        muscleGroups: ['Hamstrings', 'Glutes'],
        warmupSets: '1-2', workingSets: '2', reps: '10-12', earlyRPE: '~7', lastRPE: '~8', rest: '~2-3 min',
        substitutions: ['Single-Leg DB Hip Thrust', 'DB RDL'],
      }),
      ex({
        name: 'Leg Extension',
        muscleGroups: ['Quads'],
        warmupSets: '1-2', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Reverse Nordic', 'Sissy Squat'],
      }),
      ex({
        name: 'Standing Calf Raise',
        muscleGroups: ['Calves'],
        warmupSets: '1', workingSets: '2', reps: '15-20', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Leg Press Calf Press', 'Seated Calf Raise'],
      }),
      ex({
        name: 'Machine Hip Abduction',
        muscleGroups: ['Glutes'],
        warmupSets: '1-2', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Cable Hip Abduction', 'Lateral Band Walk'],
      }),
    ],
  };

  const arms1: WorkoutDay = {
    id: 'seed-day-arms1',
    name: 'Arms & Weak Points #1',
    exercises: [
      weakSlot(1),
      weakSlot(2),
      ex({
        name: 'EZ-Bar Curl',
        muscleGroups: ['Biceps'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['DB Curl', 'Overhead Cable Curl'],
      }),
      ex({
        name: 'Bottom-Half EZ-Bar Skull Crusher',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['DB Skull Crusher (Bottom-Half)', 'Triceps Extension (Rope)'],
      }),
      ex({
        name: 'Incline DB Curl',
        muscleGroups: ['Biceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Bayesian Cable Curl'],
      }),
      ex({
        name: 'Triceps Pressdown (Bar)',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Triceps Pressdown (Rope)', 'DB Triceps Kickback'],
      }),
      ex({
        name: 'Roman Chair Leg Raise',
        muscleGroups: ['Abs'],
        warmupSets: '1', workingSets: '3', reps: '10-20', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Machine Crunch', 'Cable Crunch'],
      }),
    ],
  };

  const pull2: WorkoutDay = {
    id: 'seed-day-pull2',
    name: 'Pull #2',
    exercises: [
      ex({
        name: 'Smith Machine Deficit Row',
        muscleGroups: ['Back Thickness'],
        warmupSets: '2-3', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~9', rest: '~3-4 min',
        substitutions: ['Pendlay Deficit Row', 'Helms Row'],
      }),
      ex({
        name: 'Neutral-Grip Lat Pulldown',
        muscleGroups: ['Back Width'],
        warmupSets: '2', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Neutral-Grip Pull-Up', 'Cross-Body Lat Pull-Around'],
      }),
      ex({
        name: 'Moto Row',
        muscleGroups: ['Back Thickness'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Helms Row', 'Chest-Supported DB Row'],
      }),
      ex({
        name: 'EZ-Bar Preacher Curl',
        muscleGroups: ['Biceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['DB Preacher Curl', 'Machine Preacher Curl'],
      }),
      ex({
        name: 'Reverse Pec Deck',
        muscleGroups: ['Rear Delts'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Bent-Over Reverse DB Flye', 'Cable Reverse Flye'],
      }),
      ex({
        name: 'Machine Shrug',
        muscleGroups: ['Traps'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['DB Shrug', 'Smith Machine Shrug'],
      }),
    ],
  };

  const push2: WorkoutDay = {
    id: 'seed-day-push2',
    name: 'Push #2',
    exercises: [
      ex({
        name: 'Cuffed Lateral Raise',
        muscleGroups: ['Shoulders'],
        warmupSets: '1', workingSets: '3', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['High-Cable Lateral Raise', 'DB Lateral Raise (Bottom-Half)'],
      }),
      ex({
        name: 'Incline DB Press',
        muscleGroups: ['Chest'],
        warmupSets: '2-3', workingSets: '2', reps: '10-12', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Incline Smith Machine Press', 'Incline Barbell Press'],
      }),
      ex({
        name: 'Seated Machine Shoulder Press',
        muscleGroups: ['Shoulders'],
        warmupSets: '2-3', workingSets: '2', reps: '10-12', earlyRPE: '~7', lastRPE: '~9', rest: '~2-3 min',
        substitutions: ['Seated DB Shoulder Press', 'Overhead Cable Shoulder Press'],
      }),
      ex({
        name: 'Overhead Triceps Extension',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '3', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Triceps Extension (Bar)', 'DB Skull Crusher'],
      }),
      ex({
        name: 'Cable Crossover',
        muscleGroups: ['Chest'],
        warmupSets: '1', workingSets: '3', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Pec Deck', 'DB Flye'],
      }),
    ],
  };

  const legs2: WorkoutDay = {
    id: 'seed-day-legs2',
    name: 'Legs #2',
    exercises: [
      ex({
        name: 'Barbell RDL',
        muscleGroups: ['Hamstrings'],
        warmupSets: '2-3', workingSets: '2', reps: '8-10', earlyRPE: '~5', lastRPE: '~5-6', rest: '~3-5 min',
        substitutions: ['DB RDL', 'Deadlift'],
      }),
      ex({
        name: 'Leg Press',
        muscleGroups: ['Quads'],
        warmupSets: '2-4', workingSets: '2', reps: '8-10', earlyRPE: '~7', lastRPE: '~8', rest: '~3-5 min',
        substitutions: ['Single-Leg Leg Press', 'High-Bar Back Squat'],
      }),
      ex({
        name: 'Smith Machine Reverse Lunge',
        muscleGroups: ['Quads', 'Glutes'],
        warmupSets: '2-3', workingSets: '2 per leg', reps: '10-12', earlyRPE: '~7', lastRPE: '~8', rest: '~2-3 min',
        substitutions: ['DB Reverse Lunge', 'DB Walking Lunge'],
      }),
      ex({
        name: 'Weighted 45° Hyperextension',
        muscleGroups: ['Hamstrings'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Smith Machine Good Morning', 'Good Morning (Light Weight)'],
      }),
      ex({
        name: 'Standing Calf Raise',
        muscleGroups: ['Calves'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Seated Calf Raise', 'Donkey Calf Raise'],
      }),
      ex({
        name: 'Machine Hip Adduction',
        muscleGroups: ['Adductors'],
        warmupSets: '1-2', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Cable Hip Adduction', 'Copenhagen Hip Adduction'],
      }),
    ],
  };

  const arms2: WorkoutDay = {
    id: 'seed-day-arms2',
    name: 'Arms & Weak Points #2',
    exercises: [
      weakSlot(1),
      weakSlot(2),
      ex({
        name: 'DB Hammer Curl',
        muscleGroups: ['Biceps', 'Forearms'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Hammer Preacher Curl', 'Reverse-Grip EZ-Bar Curl'],
      }),
      ex({
        name: 'Smith Machine JM Press',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '10-12', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Barbell JM Press', 'Close-Grip Bench Press'],
      }),
      ex({
        name: 'Single-Arm DB Scott Curl',
        muscleGroups: ['Biceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['EZ-Bar Preacher Curl', 'DB Preacher Curl'],
      }),
      ex({
        name: 'Triceps Pressdown (Rope)',
        muscleGroups: ['Triceps'],
        warmupSets: '1', workingSets: '2', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Triceps Pressdown (Bar)', 'DB Kickback'],
      }),
      ex({
        name: 'Decline Weighted Crunch',
        muscleGroups: ['Abs'],
        warmupSets: '1', workingSets: '3', reps: '12-15', earlyRPE: '~7-8', lastRPE: '~9', rest: '~1-2 min',
        substitutions: ['Ab Wheel Rollout', 'Swiss Ball Rollout'],
      }),
    ],
  };

  return [pull1, push1, legs1, arms1, pull2, push2, legs2, arms2];
}

export function createSeedProgram(): WorkoutProgram {
  return {
    id: 'seed-program-ppl',
    name: 'Pure Bodybuilding Phase 2 — PPL',
    createdAt: new Date().toISOString(),
    days: buildDays(),
  };
}
