import type { Activity } from "./catalog";
import { hasDebrief } from "./catalog";

/**
 * Branded text exports of an activity.
 *
 * Branded on purpose. The original plan called for these to be unbranded so the
 * output could be dropped into a work deck with no trace of the tool, but the
 * whole Opsette family brands what it produces and carving out one exception
 * would break that pattern for a case that is solved by deleting one line by
 * hand after pasting.
 */

const CREDIT = "Made with Icebreaker · tools.opsette.io/icebreaker";

/** The host's sheet: everything on the detail page, in reading order. */
export function toPlainText(activity: Activity): string {
  const out: string[] = [];

  out.push(activity.name.toUpperCase());
  out.push(
    `${activity.min}-${activity.max} people · ${activity.minMinutes}-${activity.maxMinutes} min · ${
      activity.materials.length === 0 ? "Nothing needed" : activity.materials.join(", ")
    }`,
  );
  out.push("");
  out.push(activity.blurb);
  out.push("");
  out.push(`WHY THIS ONE: ${activity.why}`);
  out.push("");

  out.push("STEPS");
  activity.steps.forEach((step, i) => out.push(`  ${i + 1}. ${step}`));
  out.push("");

  out.push("YOU GO FIRST");
  out.push(`  ${activity.facilitatorFirst}`);
  out.push("");

  if (activity.virtual === "adapted") {
    out.push("ON A VIDEO MEETING");
    out.push(`  ${activity.virtualNote}`);
    out.push("");
  }

  out.push("WATCH OUT FOR");
  out.push(`  ${activity.safetyNote}`);
  out.push("");

  out.push(hasDebrief(activity) ? "CLOSE WITH" : "DEBRIEF");
  out.push(`  ${activity.debrief}`);
  out.push("");

  out.push(CREDIT);

  return out.join("\n");
}

/**
 * The slide: what the room should see, and nothing else.
 *
 * This is the question the facilitator typed on the instrument screen, because
 * that is the only genuinely audience-facing content the tool holds. The
 * catalog's steps are instructions to the FACILITATOR ("Ask the question and be
 * explicit"), so exporting those as "slide text" put stage directions on a
 * slide, which is the same mistake the old step-by-step run mode made.
 *
 * With no question typed there is nothing to put on a slide, so the caller
 * hides this rather than exporting the wrong thing. See canMakeSlide.
 */
export function toSlideText(activity: Activity, prompt: string): string {
  // Title, question, credit. Nothing else.
  //
  // The debrief was in here and came out again: those lines are written to
  // the facilitator too ("Reading the wall out loud IS the debrief"), so on a
  // slide they read as stage directions.
  return [activity.name, "", prompt.trim(), "", CREDIT].join("\n");
}

/** Whether there is a question worth putting on a slide yet. */
export function canMakeSlide(prompt: string): boolean {
  return prompt.trim().length > 0;
}

/**
 * Clipboard write with a fallback. `navigator.clipboard` needs a secure context
 * (https or localhost), so on a plain-http LAN address it is undefined and a
 * bare call would throw rather than fail quietly.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* blocked — fall through to the textarea path */
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
