/** Short, practical technique cues per exercise — setup, positioning, and the most common
 * mistake to avoid. Keyed by exact exercise name so it applies whether an exercise is the
 * program's default pick or something it was swapped to. Not exhaustive; covers every
 * exercise that appears in the seed program. */
export const FORM_CUES: Record<string, string[]> = {
  'Wide-Grip Pull-Up': [
    'Grip just outside shoulder width — too wide shortens range and stresses the shoulders.',
    'Start from a full dead hang, shoulder blades down and back before you pull.',
    'Drive your elbows down and back, not just up — think "chest to bar," not "chin to bar."',
  ],
  'Chest-Supported Machine Row': [
    'Chest pad snug so your torso can’t rock — the pull should come from your back, not momentum.',
    'Pull elbows back close to your torso, squeeze shoulder blades together at the finish.',
    'Let the weight stretch your lats fully at the start of each rep.',
  ],
  'Half-Kneeling 1-Arm Lat Pulldown': [
    'Half-kneeling stance locks your torso so you can’t lean back to cheat the weight up.',
    'Reach up and slightly forward at the top for a full lat stretch before pulling.',
    'Pull your elbow down toward your hip, not straight down — think "elbow to back pocket."',
  ],
  'Cable 1-Arm Face Pull': [
    'Set the cable at head height; pull with your elbow high and out to the side.',
    'Externally rotate at the end of the pull — hand finishes past your ear, thumb back.',
    'Keep it light — this is a rear-delt/rotator cuff movement, not a strength lift.',
  ],
  'Seated Bayesian High Cable Curl': [
    'Cables set high behind you, arms reaching slightly back — this keeps tension on the biceps at the stretched position.',
    'Keep elbows still and slightly behind your torso throughout the rep.',
    'Squeeze at the top rather than swinging the weight up.',
  ],
  'Cable Crunch': [
    'Kneel far enough from the stack that the cable stays vertical over your head.',
    'Round your spine and crunch down toward your hips — this is a spinal flexion, not a hip-hinge.',
    'Keep the cable close to your body; hips stay still, only your torso curls.',
  ],
  'DB Lateral Raise': [
    'Slight forward lean and a soft bend in the elbows throughout.',
    'Lead with your elbows, not your hands — imagine pouring water out of a jug at the top.',
    'Raise to about shoulder height; going higher just shrugs the weight up with your traps.',
  ],
  'Flat Machine Chest Press': [
    'Set the seat so handles line up with mid-chest height.',
    'Shoulder blades pulled back and down into the pad before you press.',
    'Press until arms are extended but not locked out hard; control the negative back to a stretch.',
  ],
  'Bottom-Half Cable Flye': [
    'Only the bottom half of the range — start with hands near your hips and squeeze in, don’t raise past chest height.',
    'Keep a soft bend in the elbows and think about hugging a barrel, not pressing.',
    'Focus on peak contraction: pause and squeeze your chest together at the bottom of each rep.',
  ],
  'Seated DB Shoulder Press': [
    'Bench with back support, dumbbells start at ear height, elbows roughly under your wrists.',
    'Press up and slightly in so the dumbbells nearly touch at the top.',
    'Don’t flare elbows past 45° behind your torso at the bottom — keeps the shoulder in a safer position.',
  ],
  'Triceps Extension (Bar)': [
    'Elbows pinned at your sides and pointed slightly forward — they shouldn’t drift back as the weight gets heavy.',
    'Lower under control to a full stretch behind your head, then extend fully at the top.',
    'Keep your upper arm still; only the forearm moves.',
  ],
  'Cable Triceps Kickback': [
    'Hinge forward so your upper arm is parallel to the floor and locked against your side.',
    'Extend the forearm back and squeeze the triceps hard at full lockout.',
    'Keep the upper arm pinned throughout — if it swings, the weight is too heavy.',
  ],
  'Seated Leg Curl': [
    'Back of the knee lined up with the machine’s pivot point, ankle pad just above the heel.',
    'Point your toes toward your shins (dorsiflex) — this biases the hamstrings over the calves.',
    'Squeeze fully at the bottom of the curl and control the weight back up; don’t let it snap back.',
  ],
  'Smith Machine Squat': [
    'Bar across the upper traps (or lower on rear delts for high-bar/low-bar preference), feet slightly forward of the bar path.',
    'Brace your core and unrack, then break at the hips and knees together — sit back, not straight down.',
    'Push through mid-foot, knees tracking over your toes; go to at least parallel.',
  ],
  'Glute-Ham Raise': [
    'Hips right at the pad edge so you can hinge freely; ankles secure against the footplate.',
    'Lower under control by extending at the knees, keeping hips extended (not piking) throughout.',
    'Curl yourself back up using your hamstrings, not by throwing your torso.',
  ],
  'Leg Extension': [
    'Back of the knee at the machine’s pivot, pad resting on the lowest part of your shin.',
    'Point your toes up slightly and lead with your heels for more quad, less knee stress.',
    'Pause and squeeze at full extension, then lower slowly — don’t just let it drop.',
  ],
  'Standing Calf Raise': [
    'Balls of your feet on the platform, heels hanging off, knees soft (not locked).',
    'Drop into a full stretch at the bottom before driving up onto your toes.',
    'Pause at the top and squeeze — don’t just bounce through the rep.',
  ],
  'Machine Hip Abduction': [
    'Sit tall, back flat against the pad, knees against the movement pads.',
    'Push knees outward under control — avoid leaning your torso to help push the weight.',
    'Squeeze your glutes at the widest point before returning slowly.',
  ],
  'EZ-Bar Curl': [
    'Use the angled grips — they’re easier on the wrists than a straight bar.',
    'Keep elbows tucked at your sides; they shouldn’t drift forward as you curl.',
    'Control the negative instead of dropping the bar — that’s where most of the growth stimulus is.',
  ],
  'Bottom-Half EZ-Bar Skull Crusher': [
    'Only the bottom half of the range — lower to just past a 90° elbow bend, don’t go all the way to your forehead.',
    'Elbows stay pointed at the ceiling and don’t flare out as you lower.',
    'This partial keeps the triceps under constant tension — control the tempo rather than rushing it.',
  ],
  'Incline DB Curl': [
    'Set the bench to a 45–60° incline and let your arms hang straight down from your shoulders.',
    'This stretches the biceps at the bottom — don’t let your elbows drift forward to cheat the stretch.',
    'Curl without swinging the shoulders forward; keep your upper arm pinned to the bench.',
  ],
  'Triceps Pressdown (Bar)': [
    'Elbows pinned to your sides, standing tall, slight forward lean from the hips.',
    'Only your forearms move — if your elbows drift back to help, drop the weight.',
    'Extend to a full lockout and squeeze before controlling the bar back up.',
  ],
  'Roman Chair Leg Raise': [
    'Forearms on the pads, back flat against the support, core braced before you start.',
    'Raise your legs (or knees, if that’s easier) using your abs — resist the urge to swing.',
    'Posteriorly tilt your pelvis at the top (curl your hips up slightly) for a full ab contraction.',
  ],
  'Smith Machine Deficit Row': [
    'Stand on a small platform or plates so the bar has extra range to travel below your normal starting point.',
    'Hinge forward with a flat back, pull the bar into your lower ribs/upper abdomen.',
    'Let your shoulder blades protract (reach forward) at the bottom for the extra stretch — that’s the point of the deficit.',
  ],
  'Neutral-Grip Lat Pulldown': [
    'Neutral (palms-facing) handles are easier on the shoulders and bias the lower lats.',
    'Lead with your elbows down and slightly back, chest up throughout.',
    'Avoid leaning back excessively — a slight lean is fine, but don’t turn it into a row.',
  ],
  'Moto Row': [
    'Split stance, one arm braced on a support, pulling a low cable or handle back like a motorcycle throttle.',
    'Keep your torso still and let the pull come from retracting your shoulder blade, not twisting your hips.',
    'Squeeze at the back of the rep before controlling the return.',
  ],
  'EZ-Bar Preacher Curl': [
    'Armpits snug against the top of the pad — if they float off, the range is too big for the setup.',
    'Don’t fully lock out the elbows at the bottom; keep a small bend to protect the joint.',
    'Curl all the way up and squeeze; this angle emphasizes the lower biceps.',
  ],
  'Reverse Pec Deck': [
    'Face into the machine, chest against the pad, handles set at shoulder height.',
    'Lead with your elbows and squeeze your shoulder blades together at the back of the movement.',
    'Keep a slight bend in the elbows throughout — locking them out shifts stress to the joint.',
  ],
  'Machine Shrug': [
    'Grip and let your shoulders drop fully at the bottom of each rep for a full stretch.',
    'Shrug straight up toward your ears — don’t roll your shoulders forward or back.',
    'Pause and squeeze at the top rather than bouncing through reps.',
  ],
  'Cuffed Lateral Raise': [
    'Ankle-cuff or D-handle attachment at your side lets you keep constant cable tension through the whole raise, unlike dumbbells.',
    'Lead with the elbow, raise to shoulder height, slight forward lean.',
    'Control the descent — the cable makes cheating the negative obvious, so don’t let it snap back.',
  ],
  'Incline DB Press': [
    'Set the bench to 30–45° — steeper turns it into a shoulder press, flatter into a flat bench press.',
    'Dumbbells start just outside your chest, elbows at roughly 45–60° from your torso (not flared to 90°).',
    'Press up and slightly in, without locking your elbows out hard at the top.',
  ],
  'Seated Machine Shoulder Press': [
    'Seat height so the handles start level with your shoulders, not above your head.',
    'Press up without shrugging your traps up to help — keep shoulders down and back.',
    'Lower until your elbows are just below shoulder height; don’t bottom out hard on the stops.',
  ],
  'Overhead Triceps Extension': [
    'Elbows pointed forward and close to your head, staying still through the whole rep.',
    'Lower the weight behind your head to a full stretch, then extend to lockout.',
    'Keep your ribs down and core braced — don’t let your lower back arch to help the weight up.',
  ],
  'Cable Crossover': [
    'Cables set high, step forward into a slight lean, soft bend in the elbows.',
    'Bring your hands down and together in front of your hips, squeezing your chest at the bottom.',
    'Control the stretch back out — don’t let the weight yank your arms back.',
  ],
  'Barbell RDL': [
    'Soft knee bend, bar stays in contact with your legs the whole way down.',
    'Hinge at the hips — push your butt back, keep your back flat, chest up.',
    'Stop the descent when you feel a deep hamstring stretch (usually mid-shin), then drive hips forward to stand.',
  ],
  'Leg Press': [
    'Feet shoulder-width, mid-platform — too high biases glutes/hamstrings, too low stresses the knees.',
    'Lower until your knees reach about 90° (or where your lower back starts to round off the pad) — don’t let your hips lift off.',
    'Press through your whole foot, don’t lock your knees out hard at the top.',
  ],
  'Smith Machine Reverse Lunge': [
    'Bar on your upper back, step one leg back into a lunge rather than forward — easier on the knees.',
    'Drop straight down, back knee toward the floor, front shin roughly vertical.',
    'Drive through the front heel to return to standing; keep your torso upright throughout.',
  ],
  'Weighted 45° Hyperextension': [
    'Hips at the edge of the pad so you can bend freely at the hips, ankles locked under the rollers.',
    'Round down under control, then extend back to a straight line — don’t hyperextend past neutral at the top.',
    'This is a hip hinge, not a spinal extension — think glutes and hamstrings, not lower-back arching.',
  ],
  'Machine Hip Adduction': [
    'Sit tall, back against the pad, knees against the inner pads.',
    'Squeeze your inner thighs to bring your knees together under control.',
    'Avoid using momentum — a slow, controlled squeeze is more effective than fast reps.',
  ],
  'DB Hammer Curl': [
    'Neutral (palms-facing-in) grip throughout — this shifts emphasis to the brachialis/forearm.',
    'Elbows pinned at your sides, no swinging from the shoulders.',
    'Curl straight up rather than out to the side.',
  ],
  'Smith Machine JM Press': [
    'A hybrid between a close-grip bench press and skull crusher — bar path angles down toward your neck/upper chest.',
    'Elbows stay fairly narrow and pointed slightly forward, not flared.',
    'Lower under control to just above your neck, then press back to lockout.',
  ],
  'Single-Arm DB Scott Curl': [
    'Same setup as a preacher curl but one arm at a time on an angled pad — armpit snug against the top.',
    'Don’t fully lock out at the bottom; keep constant tension on the biceps.',
    'Curl and squeeze at the top without letting your shoulder rotate forward.',
  ],
  'Triceps Pressdown (Rope)': [
    'Elbows pinned at your sides, rope starts at chest height.',
    'Split the rope ends apart and rotate your palms down as you extend, for a stronger peak contraction.',
    'Keep elbows still throughout — only the forearms move.',
  ],
  'Decline Weighted Crunch': [
    'Feet secured, bench declined only slightly — a steep decline shifts the movement to hip flexors instead of abs.',
    'Curl your ribcage toward your pelvis rather than sitting all the way up — this keeps tension on the abs.',
    'Hold the weight against your chest, not behind your head, to avoid straining your neck.',
  ],
  'Wide-Grip Lat Pulldown': [
    'Grip just outside shoulder width, hands angled slightly forward if the bar allows it.',
    'Lead with your elbows down and back, chest lifted, slight backward lean (not excessive).',
    'Pull to your upper chest, squeeze your lats, then control the stretch back to full extension.',
  ],
  'Elbows-Out Cable Row': [
    'Elbows flare out to the sides (not tucked) as you row — this targets the upper back/rear delts more than a standard row.',
    'Pull to your lower chest/upper abs, squeezing your shoulder blades together.',
    'Keep your torso still; the pull comes from your back, not from rocking.',
  ],
  'Straight-Bar Lat Pulldown': [
    'Grip just outside shoulder width, slight backward lean as you initiate the pull.',
    'Drive elbows down and back, pulling the bar to your upper chest.',
    'Control the weight back to a full overhead stretch each rep.',
  ],
  'Cable Reverse Flye': [
    'Cables crossed in front of you at chest height, arms reaching across your body to start.',
    'Sweep your arms out and back, squeezing your shoulder blades together at the end.',
    'Keep a slight bend in the elbows and avoid using your traps to shrug the weight up.',
  ],
  'Bayesian High Cable Curl': [
    'Cable set high behind you so your arm starts stretched slightly back — biases the long head of the biceps.',
    'Keep your elbow still and slightly behind your torso throughout the curl.',
    'Squeeze at the top rather than letting momentum carry the weight.',
  ],
  'Machine Bench Press': [
    'Seat height so handles line up with mid-chest.',
    'Shoulder blades retracted and down into the pad before you press.',
    'Press to just short of lockout and control the negative back to a stretch at your chest.',
  ],
  'Bottom-Half Pec Deck': [
    'Only the bottom half of the range — start with arms out wide and bring them to about chest-width, not fully closed.',
    'Keep a slight bend in the elbows and lead with them, not your hands.',
    'Squeeze and pause at the inner position before controlling back out.',
  ],
  'Hack Squat': [
    'Shoulders and back flush against the pad, feet slightly forward of your hips on the platform.',
    'Lower until your thighs are at least parallel, knees tracking over your toes.',
    'Drive through your whole foot; don’t let your heels lift or your lower back round off the pad.',
  ],
  'Single-Leg DB Hip Thrust': [
    'Upper back braced on a bench, one foot planted, the other leg extended or held up.',
    'Drive through the heel of your planted foot, squeezing your glute hard at the top.',
    'Keep your hips square — don’t let the working-side hip rotate or drop.',
  ],
  'Machine Preacher Curl': [
    'Armpits snug against the top of the pad so the range matches your arm length.',
    'Don’t fully lock out the elbows at the bottom; keep tension on the biceps.',
    'Curl and squeeze at the top, then lower slowly rather than letting it drop.',
  ],
  'Diverging Pressdown (Rope)': [
    'Elbows pinned at your sides, rope handles starting together at chest height.',
    'As you press down, rotate your palms out and apart for a stronger triceps squeeze.',
    'Only your forearms move — keep your upper arms still throughout.',
  ],
  'Inverse DB Zottman Curl': [
    'Curl up with palms facing up (normal curl), then rotate your wrists to palms-down before lowering.',
    'The slow, palms-down lowering is the point — control it instead of rushing back down.',
    'Keep elbows pinned at your sides through both the curl and the reverse lowering.',
  ],
  'Close-Grip Pushup (AMRAP)': [
    'Hands roughly shoulder-width or slightly narrower, directly under your shoulders.',
    'Keep your elbows tracking back close to your torso, not flared out to the sides.',
    'Lower your chest all the way to just above the floor, then press to full lockout — go until clean failure.',
  ],
  'Ab Wheel Rollout': [
    'Start kneeling, core braced hard before you roll — think about keeping your ribs pulled down, not letting your lower back sag.',
    'Roll out only as far as you can control while keeping a flat/neutral spine.',
    'Pull back in using your abs, not by yanking with your arms.',
  ],
  'Pendlay Deficit Row': [
    'Stand on a small platform so the bar has extra range below your feet, back close to parallel with the floor.',
    'Each rep starts from a dead stop on the floor/platform — reset your position every rep, don’t bounce.',
    'Pull explosively to your lower ribs, keeping your back flat throughout.',
  ],
  'Neutral-Grip Seated Cable Row': [
    'Neutral (palms-facing) handle, slight forward lean at the start for a full lat stretch.',
    'Drive your elbows back past your torso, squeezing your shoulder blades together.',
    'Keep your torso still — the pull comes from your back, not from rocking back and forth.',
  ],
  'Cable Rope Hammer Curl': [
    'Rope attachment, neutral grip throughout — palms facing each other.',
    'Elbows pinned at your sides, no swinging from the shoulders.',
    'Squeeze at the top of each rep before lowering under control.',
  ],
  'Smith Machine Cheat Shrug': [
    'A controlled "cheat" — a small leg drive helps move heavier weight, but the shrug at the top should still be deliberate.',
    'Let your shoulders drop fully between reps for a full stretch.',
    'Shrug straight up and squeeze — don’t roll your shoulders forward or back.',
  ],
  'EZ-Bar Skull Crusher': [
    'Lying on a bench, bar starts locked out over your chest/shoulders.',
    'Lower by bending only at the elbows, bar traveling toward your forehead or just behind your head.',
    'Keep your upper arms still and roughly vertical throughout — only the forearms move.',
  ],
  'DB RDL': [
    'Dumbbells in front of your thighs, soft knee bend, back flat.',
    'Push your hips back as you lower the weights, keeping them close to your legs.',
    'Stop when you feel a deep hamstring stretch, then drive your hips forward to stand tall.',
  ],
  'Belt Squat': [
    'Belt or attachment sits at your hips so the load bypasses your spine entirely.',
    'Squat down keeping your torso upright, knees tracking over your toes.',
    'Drive through your whole foot back to standing — this is a good option when your lower back needs a break from spinal loading.',
  ],
  'DB Bulgarian Split Squat': [
    'Rear foot elevated on a bench, most of your weight on the front leg.',
    'Lower straight down until your front thigh is roughly parallel to the floor.',
    'Keep your torso fairly upright and front knee tracking over your toes, not caving inward.',
  ],
  'Machine Crunch': [
    'Adjust the seat/pad so the pivot lines up with your midsection, not your hips.',
    'Curl your torso down by contracting your abs, not by pulling with your arms on the handles.',
    'Squeeze at the bottom of the crunch, then return under control.',
  ],
};

export function getFormCues(exerciseName: string): string[] | undefined {
  return FORM_CUES[exerciseName];
}
