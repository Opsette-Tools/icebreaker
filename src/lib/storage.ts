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

export function rateRun(id: string, rating: RunRating): void {
  const next = getHistory().map((r) => (r.id === id ? { ...r, rating } : r));
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
