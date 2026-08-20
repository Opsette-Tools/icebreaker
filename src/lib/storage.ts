/**
 * The ONE place Icebreaker touches persistent storage.
 *
 * Engine: localStorage. Everything this tool persists is small JSON — a run
 * history record is an activity id, a group size, a duration, a date and a
 * rating, on the order of 120 bytes. A facilitator running two icebreakers a
 * week for five years lands around 60KB, roughly 1% of the ~5MB budget. There
 * is no binary here and no query an index would help with (the history list is
 * always loaded whole), so IndexedDB would buy an async API and a migration
 * surface for capabilities the tool never uses.
 *
 * The durable decision is not the engine — it is that the engine has exactly
 * ONE module. Every read and write in the app goes through the functions below,
 * so if this ever does need IndexedDB (Phase 2's flow builder growing real
 * queries, or stored binary artifacts), the migration is: rewrite this file and
 * make the callers await. Nothing else moves. Do NOT call localStorage directly
 * from a component — that is what makes a swap expensive.
 *
 * Every read is total: a corrupt, absent, or older-shaped blob falls back to
 * the empty value rather than throwing. Persistence is best-effort; a storage
 * failure (private mode, quota) must never break a live facilitation.
 */

const PREFIX = "icebreaker:";

/** Bump when a stored shape changes incompatibly; unknown versions are dropped. */
const SCHEMA_VERSION = 1;

type Envelope<T> = { v: number; data: T };

function readRaw<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== SCHEMA_VERSION) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

function writeRaw<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: Envelope<T> = { v: SCHEMA_VERSION, data };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(envelope));
  } catch {
    /* quota / private mode — non-fatal, never break a live run */
  }
}

function removeRaw(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* non-fatal */
  }
}

// ── Run history ────────────────────────────────────────────────────────────

export type RunRating = "worked" | "flopped";

export type RunRecord = {
  id: string;
  /** Activity id from the catalog. */
  activityId: string;
  /** Denormalized so history still reads correctly if a catalog entry is renamed. */
  activityName: string;
  /** ISO timestamp of when the run was started. */
  ranAt: string;
  groupSize: number;
  minutes: number;
  /** Which familiarity answer was given, for the "you ran this before" check. */
  familiarity: Familiarity;
  /**
   * The question actually asked on this run, for activities that carry one.
   * Stored on the RECORD, not looked up per activity: two runs of Chat
   * Waterfall differ by the question, and reading the current one would show
   * whatever was typed most recently against every past run.
   */
  prompt?: string;
  rating?: RunRating;
};

const HISTORY_KEY = "history";

/** Cap the stored history so a heavy user can never approach the quota. */
const HISTORY_LIMIT = 500;

export function getHistory(): RunRecord[] {
  const rows = readRaw<RunRecord[]>(HISTORY_KEY);
  if (!Array.isArray(rows)) return [];
  // Defensive: drop anything that lost its identifying fields.
  return rows.filter((r) => r && typeof r.activityId === "string" && typeof r.ranAt === "string");
}

export function addRun(record: RunRecord): void {
  const next = [record, ...getHistory()].slice(0, HISTORY_LIMIT);
  writeRaw(HISTORY_KEY, next);
}

/** Set or clear a run's rating. `null` unrates it. */
export function rateRun(id: string, rating: RunRating | null): void {
  const next = getHistory().map((r) => (r.id === id ? { ...r, rating: rating ?? undefined } : r));
  writeRaw(HISTORY_KEY, next);
}

export function clearHistory(): void {
  removeRaw(HISTORY_KEY);
}

/** Most recent run of this activity, or null. Drives the repeat warning. */
export function lastRunOf(activityId: string): RunRecord | null {
  return getHistory().find((r) => r.activityId === activityId) ?? null;
}

// ── Last intake answers ────────────────────────────────────────────────────

export type Familiarity = "strangers" | "colleagues" | "close";

export type Intake = {
  groupSize: number;
  minutes: number;
  familiarity: Familiarity;
};

const INTAKE_KEY = "intake";

export function getLastIntake(): Intake | null {
  const saved = readRaw<Intake>(INTAKE_KEY);
  if (!saved || typeof saved.groupSize !== "number" || typeof saved.minutes !== "number") {
    return null;
  }
  return saved;
}

export function saveIntake(intake: Intake): void {
  writeRaw(INTAKE_KEY, intake);
}

// ── Roster ─────────────────────────────────────────────────────────────────

/**
 * The list of names the picker draws from. Kept because a facilitator runs
 * meetings with the same team repeatedly and retyping the roster every week is
 * the kind of friction that stops a tool being used.
 */
const ROSTER_KEY = "roster";

export function getRoster(): string {
  return readRaw<string>(ROSTER_KEY) ?? "";
}

export function saveRoster(text: string): void {
  writeRaw(ROSTER_KEY, text);
}

// ── Prompts ────────────────────────────────────────────────────────────────

/**
 * The question the facilitator types for a prompt-carrying activity, kept per
 * activity id.
 *
 * Persisted because it is the ONE piece of audience-facing content the tool
 * has: the catalog's steps are instructions to the facilitator, so the typed
 * question is the only thing that genuinely belongs on a shared slide. Holding
 * it in component state meant the export couldn't see it, which made "copy
 * slide text" export the facilitator's stage directions instead.
 *
 * Also saves retyping a question that took thought to choose.
 */
const PROMPTS_KEY = "prompts";

export function getPrompt(activityId: string): string {
  const all = readRaw<Record<string, string>>(PROMPTS_KEY);
  return all?.[activityId] ?? "";
}

export function savePrompt(activityId: string, text: string): void {
  const all = readRaw<Record<string, string>>(PROMPTS_KEY) ?? {};
  if (text.trim()) all[activityId] = text;
  else delete all[activityId];
  writeRaw(PROMPTS_KEY, all);
}
