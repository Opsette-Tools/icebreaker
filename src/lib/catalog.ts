/**
 * The activity catalog: types, the loaded data, and the filter.
 *
 * The JSON ships as a bundled static asset (it is imported, not fetched, and
 * not stored). It is the tool's content, not the user's data.
 *
 * This file at src/lib/activities.json is the ONLY copy. There was briefly a
 * second at data/activities.json and the two silently diverged within a day,
 * because edits landed on the imported one and nothing pointed at the other.
 */
import raw from "./activities.json";
import type { Familiarity } from "./storage";

export type Virtual = "native" | "adapted";
export type Physicality = "none" | "camera" | "light" | "full";
export type Energy = "calm" | "warm" | "light" | "focused" | "high";

export type TimerPhase = {
  label: string;
  seconds: number;
};

export type Activity = {
  id: string;
  name: string;
  category: string;
  min: number;
  max: number;
  minMinutes: number;
  maxMinutes: number;
  materials: string[];
  virtual: Virtual;
  virtualNote: string;
  /** 1–5. Nothing in the shipped catalog is a 5. */
  vulnerability: number;
  physicality: Physicality;
  energy: Energy;
  purpose: string[];
  blurb: string;
  why: string;
  /** Always 4 beats, written to be read one at a time on screen. */
  steps: string[];
  facilitatorFirst: string;
  /** The closing question, or a sentence explicitly saying no debrief. */
  debrief: string;
  timerPhases?: TimerPhase[];
  safetyNote: string;
};

type CatalogFile = {
  version: number;
  generated: string;
  activities: Activity[];
};

const file = raw as unknown as CatalogFile;

export const ACTIVITIES: Activity[] = file.activities;

export function activityById(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

/**
 * A debrief field starting with "None" means the activity deliberately has no
 * debrief — the run screen says so out loud rather than skipping the beat.
 */
export function hasDebrief(activity: Activity): boolean {
  return !/^none\b/i.test(activity.debrief.trim());
}

/** Total seconds across an activity's timed phases, or 0 if it has none. */
export function totalTimedSeconds(activity: Activity): number {
  return (activity.timerPhases ?? []).reduce((sum, p) => sum + p.seconds, 0);
}

// ── Instruments ────────────────────────────────────────────────────────────

/**
 * A facilitation instrument is something on screen that DOES something during
 * the run, as opposed to instructions the facilitator reads. Three kinds:
 *
 *   timer   a countdown the room can see, with a labelled end state
 *   prompt  a question or line held on screen while people think and answer
 *   picker  who goes next, or make the pairs
 *
 * Most activities need none, and that is a property of the activity, not a gap.
 * This Or That is fired off verbally at speed; putting it on screen would kill
 * the pace. Change Three Things would be spoiled by showing anything.
 *
 * Derived rather than stored as a field, so it can't drift from the data it
 * depends on: timer follows timerPhases, picker follows the roster of
 * activities whose steps involve choosing a person or forming pairs.
 */
export type Instrument = "timer" | "prompt" | "picker";

/**
 * Activities whose steps involve picking a person, taking turns in a
 * deliberate order, or pairing up. Listed explicitly because the signal lives
 * in prose ("pair everyone into breakouts", "move to the next person") and
 * pattern-matching it at runtime would be brittle.
 */
const NEEDS_PICKER = new Set([
  "weather-checkin",
  "conversation-questions",
  "change-three-things",
  "two-truths-one-lie",
  "speed-dating",
  "coat-of-arms",
  "back-to-back-drawing",
  "near-and-far",
  "amazing-future",
  "rock-paper-scissors-tournament",
  "interview-pairs",
  "passions-grid",
  "whose-story",
  "name-game",
]);

/**
 * Activities that hold a question on screen. Kept small and deliberate: an
 * activity only qualifies if there is ONE line the whole group works from at
 * the same time. Round-robin questions asked aloud don't qualify.
 *
 * NOTE: the question text itself is not in the catalog yet. Until the question
 * bank exists, the prompt instrument renders an editable field the facilitator
 * types into, which is honest and still useful.
 */
const NEEDS_PROMPT = new Set([
  "chat-waterfall",
  "conversation-questions",
  "celebrate-wins",
  "have-you-ever",
  "just-the-facts",
  "four-quadrants",
  "unique-and-shared",
  "show-and-tell",
  "one-word-close",
  "bringing-to-meeting",
]);

export function instrumentsFor(activity: Activity): Instrument[] {
  const out: Instrument[] = [];
  if (NEEDS_PROMPT.has(activity.id)) out.push("prompt");
  if ((activity.timerPhases ?? []).length > 0) out.push("timer");
  if (NEEDS_PICKER.has(activity.id)) out.push("picker");
  return out;
}

// ── The filter ─────────────────────────────────────────────────────────────

/**
 * The third intake question maps to a vulnerability CEILING. The user never
 * sees the number — they answer how well the group knows each other, and this
 * is what that means. Documented in the build plan.
 */
export const VULNERABILITY_CEILING: Record<Familiarity, number> = {
  strangers: 2,
  colleagues: 3,
  close: 4,
};

/**
 * The time question is asked in buckets, not a free number. Typing "12 minutes"
 * implied a precision the catalog does not have (its ranges are things like
 * 5-10 and 15-20), and it invited answers no activity was written for. These
 * brackets sit on the real clusters in the data.
 *
 * `cap` is the ceiling a candidate's midpoint has to fit under.
 */
export const TIME_BUCKETS = [
  { label: "Under 5 minutes", cap: 5 },
  { label: "5 to 10 minutes", cap: 10 },
  { label: "10 to 20 minutes", cap: 20 },
  { label: "20 to 30 minutes", cap: 30 },
] as const;

export type Refinements = {
  /** "wake them up" / "settle them down" — omitted means no preference. */
  energy?: "up" | "down";
  /** opener / closer / reset — omitted means no preference. */
  purpose?: "opener" | "closer" | "reset";
  /** Keep it camera-optional: excludes anything needing to be seen or to move. */
  cameraOptional?: boolean;
};

const ENERGY_UP: Energy[] = ["high", "light", "warm"];
const ENERGY_DOWN: Energy[] = ["calm", "focused"];

const PURPOSE_TAGS: Record<NonNullable<Refinements["purpose"]>, string[]> = {
  opener: ["arrive", "check-in", "read-the-room", "focus", "names", "connect"],
  closer: ["close", "check-out"],
  reset: ["reset", "energize", "morale"],
};

export type Query = {
  groupSize: number;
  minutes: number;
  familiarity: Familiarity;
} & Refinements;

/**
 * Hard constraints (size, time, vulnerability ceiling, accessibility) filter.
 * Soft preferences (energy, purpose) rank rather than exclude, so the result is
 * never empty just because someone asked for a closer at a size where none fit.
 */
export function filterActivities(query: Query): Activity[] {
  const ceiling = VULNERABILITY_CEILING[query.familiarity];

  const eligible = ACTIVITIES.filter((a) => {
    if (query.groupSize < a.min || query.groupSize > a.max) return false;
    // The time entered is a CEILING, not a target. Someone who says 10 minutes
    // has 10 minutes, so an activity that runs 10-20 does not belong in that
    // slot. Checking minMinutes alone let The Movie Pitch (10-20) through at
    // 10 minutes, which is how a meeting overruns.
    //
    // Checking maxMinutes instead is too strict: most ranges straddle the
    // common answers, and it left 5 minutes with one single option. The
    // midpoint is the activity's realistic run, so that is what has to fit.
    if ((a.minMinutes + a.maxMinutes) / 2 > query.minutes) return false;
    if (a.vulnerability > ceiling) return false;
    if (query.cameraOptional && a.physicality !== "none") return false;
    // Asking for a closer is a CONSTRAINT, not a preference. Scored as a bonus
    // it loses to a better-sized activity that doesn't close anything — a
    // 15-minute slot was recommending Two Truths And A Lie as a "closer".
    // Same for an explicit mid-meeting reset. Openers stay soft: most
    // activities work as one, so filtering there would throw away good answers.
    if (query.purpose === "closer" || query.purpose === "reset") {
      if (!a.purpose.some((p) => PURPOSE_TAGS[query.purpose!].includes(p))) return false;
    }
    return true;
  });

  return eligible.slice().sort((a, b) => score(b, query) - score(a, query));
}

function score(a: Activity, query: Query): number {
  let s = 0;

  if (query.energy === "up" && ENERGY_UP.includes(a.energy)) s += 3;
  if (query.energy === "down" && ENERGY_DOWN.includes(a.energy)) s += 3;

  // Openers only — closer/reset are enforced as constraints above, so scoring
  // them again would just re-rank an already-correct set.
  if (query.purpose === "opener" && a.purpose.some((p) => PURPOSE_TAGS.opener.includes(p))) {
    s += 3;
  }

  // Prefer activities that USE the time available — a 3-minute filler offered
  // for a 20-minute slot is a worse answer than something built for 20. This
  // only ever re-ranks activities that already passed the hard constraints, so
  // weighting it heavily can't smuggle in something that doesn't belong.
  const fit = Math.min(a.maxMinutes, query.minutes) / query.minutes;
  s += fit * 5;

  // Nudge toward native-virtual over adapted, all else equal.
  if (a.virtual === "native") s += 0.5;

  // Nothing needed is one less way for a run to fall apart.
  if (a.materials.length === 0) s += 0.25;

  return s;
}
