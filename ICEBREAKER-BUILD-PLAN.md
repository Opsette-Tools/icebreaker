# Icebreaker — Build Plan (breakout session)

**Owner:** Ruthnie / Opsette Tools
**Created:** 2026-08-20
**Status:** Planning doc. Take into a fresh build session.
**Slug / folder / repo:** `icebreaker` → `tools.opsette.io/icebreaker/`
**Dev port:** **8127** (next free — 8126 is banner-designer)
**Phosphor icon:** `Snowflake` (`snowflake`) — ice, breaking the ice. Not yet in `ICONS_AND_BRANDING.md`; add the row when the icon is generated.

---

## What this tool is

**A facilitation tool for virtual meetings.** Not a generator. The generator is the boring 10%.

The gap it fills isn't "I can't think of an icebreaker" — a hundred blog posts solve that. The gap is the ninety seconds where someone reads an activity off a blog post, explains the rules badly, forgets to go first, doesn't time anything, and the call dies. Every facilitation guide gives the same advice — model it yourself, state the rules and the timeframe, run the debrief — and nobody follows it, because the advice is a wall of prose and the meeting has already started.

**So: the tool makes that advice executable instead of readable.** You answer three questions about your meeting, it hands you one activity, and then it *runs* it — rules one beat at a time, a real timer for the actual phase, your own answer to model, and the debrief question on the last screen.

### Two hard scope calls (decided 2026-08-20)

1. **Virtual-only.** Every activity in the catalog either works on a video call as-is or ships with a written adaptation. Anything needing a shared physical room is **cut, not included-with-an-asterisk**. This is why the catalog is 37 activities and not 66 — the roster was filtered, not padded. No "stand in a circle," no Human Knot, no Marshmallow Challenge.
2. **No backend. No room codes. No phones-join-a-session.** The facilitator's screen is the only surface. Static site, JSON catalog, `localStorage` for history. Nothing to host, nothing to pay for, nothing to ask IT about. This is a hard architectural boundary — a room-code feature would drag in Supabase, auth, and a cost line, and it is explicitly **out of scope forever**, not "phase 3."

---

## ⚠️ The ownership constraint — read this before designing anything

**This tool is Ruthnie's. It is not her employer's.**

She intends to use it at work — she'll facilitate genuinely good icebreakers on team calls — but she is **not** presenting the tool to her company. The plan is deliberate: run the tool privately, then present the *output* as a prepared deck. To the room, she prepared a nice slide. The tool stays hers, unbranded and unmentioned in that context.

The reasoning is sound and the build must respect it. A tool that is visibly a *tool* in a work setting gets absorbed — someone asks for a feature for another department, and now it's an unpaid work product with disputed ownership. If this ever becomes a product, that ambiguity is expensive to unwind.

**What this means concretely for the build:**

- **A clean export path is a P0 feature, not a nice-to-have.** The tool must produce a run-ready artifact that carries no Opsette branding, no tool name, no footer, no "made with." Ruthnie should be able to drop it into a deck and have it look like she wrote it.
- **The in-app experience keeps full Opsette chrome** (shared header, share button, About/Privacy). That's the product. The *export* is the deliberately unbranded thing.
- Build the export as **"Copy as plain text"** and **"Copy as slide text"** first — those paste straight into PowerPoint or Google Slides and are ten minutes of work. A PDF/PNG export can come later; the clipboard covers the actual need.
- Never auto-stamp the tool name onto exported content. The export is hers.

There is nothing to litigate here. This is her call about her own work, and it is a reasonable one.

---

## The catalog — already built

**`data/activities.json` exists and is validated.** 37 activities. This was the tedious part and it's done, so the build session starts with real data instead of inventing it.

Each activity carries:

| Field | What it is |
|---|---|
| `id`, `name`, `category` | Identity. Categories: meetings, quick, virtual, know-each-other, fun, deeper, teamwork, large, small, closers |
| `min`, `max` | Group size range |
| `minMinutes`, `maxMinutes` | Duration range |
| `materials` | Array; empty means nothing needed |
| `virtual` | `native` (23) or `adapted` (14) — the roster is pre-filtered, so no `no` values ship |
| `virtualNote` | **The written adaptation.** For `adapted` activities this is the actual rewrite, not a warning |
| `vulnerability` | **1–5. The differentiator — see below** |
| `physicality` | `none` / `camera` / `light` — accessibility filter |
| `energy` | calm / warm / light / focused / high |
| `purpose` | Array — arrive, connect, energize, teamwork, morale, close… |
| `blurb` | One line, what it is |
| `why` | One line, *when you'd reach for it* — the editorial voice |
| `steps` | 4 short beats. **Written to be read one at a time on screen, not as a paragraph** |
| `facilitatorFirst` | The model-it-yourself line. This is the single highest-value field in the file |
| `debrief` | The closing question, or an explicit "None" |
| `timerPhases` | `[{label, seconds}]` — drives the run-mode timer. 22 activities have real phases |
| `safetyNote` | How this one goes wrong |

**Validated:** no duplicate ids, no missing required fields, and **zero empty results across 192 realistic filter combinations** (3–100 people × 3–30 min × vulnerability 1–4). The filter always returns something useful, and it narrows correctly at the extremes — 100 people / 5 minutes returns 6, not 30.

### The vulnerability dial — the thing nobody else has

Every icebreaker roundup names the "cheesy" problem in its intro and then does nothing about it. The reason icebreakers get eye-rolled is almost always a **mismatch**: an activity that asks for real self-disclosure, run on a group that hasn't earned it.

So it's a first-class, filterable field:

- **1** — Zero exposure. Safe for strangers and safe across a power imbalance.
- **2** — Preferences and opinions only.
- **3** — Light personal history or current mood. Fine for an established team.
- **4** — Genuine self-disclosure. Needs existing trust.
- **5** — Life story, identity, struggle. Retreat only. *(Nothing in the catalog is a 5 — those activities didn't survive the virtual filter, which is a happy accident.)*

**The tool should actively warn**, not just filter: if someone picks a level-4 activity for a group they've flagged as new, say so on the run screen. That single behavior is the whole editorial point of the tool.

Second differentiating field: **`physicality`**. Some activities assume everyone can move, be seen, or be on camera. `none` / `camera` / `light` is a twenty-minute build that makes the tool usable by a real HR team instead of quietly excluding someone.

---

## The three-question entry point

Not a category list. The blog is a list — you have a database, so ask the question every facilitator actually has at 8:58am:

> **How many people?** · **How long have you got?** · **How well do they know each other?**

That third question maps to the vulnerability ceiling — *never* show the user the number:

| Answer | Ceiling |
|---|---|
| "They've never met" | ≤ 2 |
| "They work together but aren't close" | ≤ 3 |
| "Tight team, been together a while" | ≤ 4 |

Optional refinements, collapsed behind a "more" link — don't put them in the primary flow:

- Energy: *need to wake them up* / *need to settle them down*
- Purpose: opener / closer / mid-meeting reset
- Accessibility: "keep it camera-optional"

Result screen shows **one recommendation, prominently**, plus three alternates underneath. One clear answer beats a grid of thirty — the grid is what the blog already is.

---

## Facilitator Mode — the actual product

Full-screen. Everything else is a browsing UI wrapped around this.

```
┌──────────────────────────────────────────────────────────┐
│  Weather Check-In              8 people · 5 min · [Exit] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│    Explain the frame: describe your current state        │
│    as weather. One sentence, no explanation needed.      │
│                                                          │
│                                        ● ○ ○ ○           │
├──────────────────────────────────────────────────────────┤
│  ← Back                                        Next →    │
└──────────────────────────────────────────────────────────┘
```

**The beats, in order:**

1. **Why we're doing this** — one line the facilitator can read aloud. Every facilitation guide says to give the group a reason and nobody does.
2. **Steps, one per screen.** Huge type. Not a paragraph — one instruction, then Next.
3. **The "you go first" card.** Renders `facilitatorFirst` in a visually distinct treatment. This is the feature that prevents most icebreaker deaths and it should look like the most important screen in the app, because it is.
4. **Timer screen** for activities with `timerPhases`. Real countdown for *the actual phase* — Rapid Pairs is 3 minutes × 5 rounds, so ring the rotation bell; don't display "15–20 min" and leave the facilitator watching a clock.
5. **Debrief screen** — the closing question, or an explicit "No debrief — move straight on." The debrief is the first thing skipped and often where the value is.

**Design constraints:**

- Screen-share legible. Minimum ~24px body, ~40px+ for step text. Assume it's being shared into a call and someone is watching on a laptop in a bright room.
- **Keyboard-driven.** Space/→ advance, ← back, Esc exits. The facilitator is talking, not hunting for a mouse.
- No decoration on the run screens. Type, space, and the progress dots. This is the one place where restraint is functional, not just stylistic.
- Safety note visible to the facilitator **before** the run starts — never mid-run.

---

## Build phases

### Phase 1 — the core loop (this is the whole tool)

- Three-question intake → filtered result → one recommendation + three alternates
- Activity detail view (blurb, why, steps, materials, safety note, virtual adaptation)
- **Facilitator Mode** with step-through, timer, "you go first," debrief
- `localStorage` history: what you ran, with which group, when
- **Export: "Copy as plain text" + "Copy as slide text"** — unbranded, per the ownership constraint

That's a complete, genuinely useful product. Ship it before adding anything below.

### Phase 2 — the thing that makes it a habit

- **Meeting flow builder** — chain a 2-minute opener, the main activity, and a closer into one named agenda. Save it. This is what turns a one-off tool into a weekly one.
- **Reuse memory** — "you ran this with this team in March." Repeating an icebreaker is the fastest way to lose a room, and it's the mistake a busy facilitator actually makes.
- **Worked / flopped rating** — one tap after a run. After a quarter you'd have real data about *your specific coworkers*, which no other tool can give you.

### Phase 3 — only if it earns it

- Question bank as its own mode (This-or-That, check-in questions, thought-provoking) — cheap, useful, and a natural second surface
- PDF / PNG export of a run card
- Custom activities the user adds themselves

---

## Family conventions — non-negotiable

Per `README.md`, `HEAD_AND_MANIFEST.md`, `HEADER_BAR.md`:

- **Ant Design.** Not raw Tailwind/shadcn primitives.
- **`base: command === "build" ? "/icebreaker/" : "/"`** — hardcoded. Never `process.env.VITE_BASE`. (Memory: `feedback_vite_base_pattern`.)
- **Head + manifest per spec.** Title `Icebreaker — Opsette`. `theme-color` `#2f4f46`, manifest `background_color` `#fafafa`, author always `Opsette`.
- **Shared `OpsetteHeader`** from `_shared/opsette-header/` — it owns the share-button slot. Don't place `ShareAppButton` loosely.
- **`opsette-share` bundle** wired per `_shared/opsette-share/INTEGRATION.md`.
- **About + Privacy routes**, `BrowserRouter` with `basename={import.meta.env.BASE_URL...}`.
- **Colors in one place** — `src/lib/theme.ts` + CSS variables. No inline hex. Suggested accent: a cool slate-blue, fitting for ice; stays inside the family's neutral-and-restrained rule.
- **Mobile-first**, but note the real primary surface here is a **desktop screen being shared**. Mobile should work for browsing and picking; Facilitator Mode is desktop-first by nature. Design both deliberately rather than letting mobile fall out by accident.
- **Typecheck with `tsc -b`**, not `tsc --noEmit` (memory: `project_opsette_tools_typecheck_command`).
- **`uuid()` helper**, not `crypto.randomUUID` (memory: `project_crypto_uuid_secure_context`).

### Head values for the spec table

| Field | Value |
|---|---|
| Slug | `icebreaker` |
| Tool Name | Icebreaker |
| Short Name | `Icebreaker` (10 chars — fits) |
| Description | Pick the right icebreaker for your video call, then run it — rules, timers, and prompts on one screen. |

Add this row to `HEAD_AND_MANIFEST.md`'s per-tool table and to the landing page when the tool ships. **Keep the two in sync.**

---

## Storage — decided 2026-08-20

**localStorage, behind one module** (`src/lib/storage.ts`). Written and in place.

The difference between the two engines is not only capacity, which is the part that's
easy to assume:

| | localStorage | IndexedDB |
|---|---|---|
| Capacity | ~5MB per origin | Hundreds of MB |
| Stores | Strings only | Structured values, plus `Blob`/`File` binary |
| API | Synchronous | Asynchronous — every read is a promise |
| Querying | None; load the blob and filter in JS | Real indexes |
| Migrations | Roll your own version field | Built-in `onupgradeneeded` |
| Failure at quota | Throws, and the write silently vanishes | Far more headroom before it matters |

What decided it: this tool persists a run history record (activity id, group size,
minutes, date, rating) at roughly 120 bytes each. Two runs a week for five years is
about 60KB — near 1% of the budget. There's no binary, and the history list is always
loaded whole, so no index would ever be used. Choosing IndexedDB would pay the async
tax on day one for capabilities the tool never touches; every component reading history
would need a loading state instead of rendering on first paint.

**The durable decision is the seam, not the engine.** Storage migrations are expensive
in proportion to how many places call storage directly. Because every read and write
goes through `storage.ts`, swapping engines later is: rewrite that one file, make the
callers `await`. That is what makes the choice cheap to revisit, and it is why picking
IndexedDB "just in case" buys nothing today. **Do not call `localStorage` directly from
a component** — that is the rule that keeps this true.

The stored blob is wrapped in a `{ v, data }` envelope with `SCHEMA_VERSION`; an
unrecognized version is dropped rather than migrated. History is capped at 500 records.

Revisit if Phase 2's flow builder grows real queries over many saved agendas, or if
anything binary ever gets stored. Both are decisions to make with real data in hand.

Note this is per-browser, per-device either way. Neither engine shares data between
machines or between people — that's the no-backend boundary, and it's intentional. The
tool being "available for everyone" means it's a free public URL, not shared state.

---

## ⚠️ Catalog gap found during the build — closers

**The catalog has exactly ONE closer-tagged activity: One Word Close** (`close`,
`check-out`). The `closers` category has one member. `reset` has one activity tagged.

Found by sweeping the filter over 3,456 refinement combinations: every one of the 324
empty results traced to the purpose filter, and specifically to closers. Every "closer"
request in the app returns that same single activity.

Two consequences:

1. The purpose refinement works correctly but has almost nothing to choose from at the
   closer end. It's honest — it never returns a mislabeled non-closer — but it's thin.
2. **Phase 2's meeting flow builder assumes you can chain an opener, a main activity,
   and a closer.** With one closer, every saved flow ends the same way. This needs
   catalog work before that feature is worth building.

The fix is data, not code: either tag existing activities that genuinely work as closers
(several `connect` / `morale` ones plausibly do), or write new ones. That's a content
pass, and it should happen before Phase 2.

---

## Deferred / open

- **Phosphor `Snowflake` icon** not yet generated. Needs `favicon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `og-image.png` per the icon spec.
- **GitHub repo** not created. Repo name must be exactly `icebreaker` to match the slug and the Actions-injected base path.
- **Landing page card** on `opsette-tools.github.io` — add when the tool ships.
- **Question bank** (This-or-That, check-in, thought-provoking) is Phase 3 and has no data file yet. Roughly 200 questions across 9 categories exist in the source survey if it gets built.
- **`data/activities.schema.json`** is referenced by `$schema` in the catalog but not yet written. Optional — write it if the build session wants editor validation.

---

## Progress log

**2026-08-20 — planning session.** Surveyed the source roundup (66 activities + ~200 questions). Filtered to 37 that survive a video call, wrote the adaptations for the 14 that need one, and rated all 37 on vulnerability and physicality. Wrote and validated `data/activities.json`. Confirmed the filter returns non-empty across 192 query combinations. Scope locked: virtual-only, no backend, no room codes. Ownership constraint documented — tool stays Ruthnie's, exports ship unbranded. Port 8127 assigned. Nothing built yet; this doc and the catalog are the deliverable.

**2026-08-20 — Session A (scaffold + intake + results).** Built, typechecking clean (`tsc -b`), dev server live on 8127.

Shipped:

- Vite + React SPA scaffold. `base: command === "build" ? "/icebreaker/" : "/"`, hardcoded. Port 8127, `strictPort`.
- Head + manifest per spec — title `Icebreaker — Opsette`, `theme-color` `#2f4f46`, manifest `background_color` `#fafafa`, author `Opsette`, OG/Twitter tags pointing at `tools.opsette.io/icebreaker/`.
- Shared `OpsetteHeader` + `opsette-share` bundles copied in and configured. Header owns the share button; dark-mode switch passed via `rightExtra`. `AppShell` wraps every route. Note: the shared `ThemeToggleButton.tsx` is Tailwind-classed and unusable in an Ant app — used the AntD `Switch` pattern the header doc prescribes instead.
- `BrowserRouter` with `basename` from `BASE_URL`. Routes: `/`, `/about`, `/privacy`, catch-all.
- `src/lib/theme.ts` — accent `#3E5C76` light / `#8FB3D9` dark, plus CSS variables in `styles.css`. No inline hex in components.
- `src/lib/storage.ts` — the single storage seam. See the Storage section above.
- `src/lib/catalog.ts` — typed catalog, `filterActivities`, `VULNERABILITY_CEILING`, `hasDebrief`, `totalTimedSeconds`. Catalog copied to `src/lib/activities.json` and imported as a bundled asset.
- Three-question intake with collapsed refinements (energy / where it sits / camera-optional), result view with one recommendation + three alternates, About and Privacy pages.
- Phosphor `Snowflake` icon set generated — added the `icebreaker` row to `_shared/brand-icons/generate.mjs`, ran it, plus `generate-og.mjs`. `favicon.svg`, `favicon.ico`, `icon-192`, `icon-512`, `icon-512-maskable`, `og-image.png` all in `public/`.

Two scoring bugs found and fixed by sweeping the filter, both of which would have shipped wrong recommendations:

1. **Time-fit was underweighted** (×2). A 3–6 minute activity ranked top for a 15-minute slot. Raised to ×5.
2. **Purpose was scored, not enforced.** Once time-fit was corrected, asking for a closer returned *Two Truths And A Lie* — correctly sized, closes nothing. Weight tuning can't fix this; at ×2 the right answer came up for the wrong reason and at ×5 the wrong answer won. `closer` and `reset` are now **hard constraints** in the filter. `opener` stays a soft bonus, since most activities work as one and filtering would discard good answers.

Validation after the fix: 3,456 refinement combinations — 0 vulnerability-ceiling violations, 0 purpose violations. The base three-question flow returns non-empty across all 144 combinations. The 324 empty results all trace to the closers gap documented above.

**Left for Session B:** Facilitator Mode. `handlePick` in `src/pages/Index.tsx` is currently a `console.info` stub — that's the seam it hangs off. Also still open: the activity detail view (steps/materials/safety note/virtual adaptation before the run starts), the vulnerability-mismatch warning, and the repeat warning (`lastRunOf` is written and unused).

**Not yet done, carried from Deferred:** GitHub repo (`icebreaker`), Actions deploy, `HEAD_AND_MANIFEST.md` row, `ICONS_AND_BRANDING.md` row (Snowflake), landing-page card. `data/activities.schema.json` still unwritten.

**2026-08-20 — Session A, part 2 (design pass + real-use fixes).** All from Ruthnie testing the running app.

Fixed:

- **Time is now a cap, not a floor.** The filter only checked `minMinutes`, so picking 10 minutes offered The Movie Pitch (10-20). Tried a strict ceiling on `maxMinutes` first: too strict, it left "5 minutes" with one single option and produced 27 empty combinations. Landed on the **midpoint** having to fit the slot. 3 empty combinations, and Movie Pitch correctly disappears at 10 minutes and returns at 15.
- **Time question is buckets, not a number field.** Under 5 / 5 to 10 / 10 to 20 / 20 to 30, in `TIME_BUCKETS` in `catalog.ts`. Typing "12 minutes" implied a precision the catalog does not have. The brackets sit on the real clusters in the data.
- **`/browse` — every icebreaker, unfiltered.** All 37 with search and a category filter. Linked from the intake footer and from under the alternates. Added because the curated three felt thin and there was no way out of the curation.
- **Diversity Welcome copy.** "Names kinds of people in the room" did not say what it meant. Now: "welcomes the room out loud by naming situations people might be in, like being new, being skeptical, or joining from a different time zone." Step text got the same fix.
- **Full stylesheet pass.** Type down a few pixels across the board (h1 44→34 max, lede 17→15, labels 19→16, choices 15→14, antd controls 40→34px). Vertical spacing cut so the intake sits on one screen without scrolling. Questions numbered `1.` `2.` `3.` at the same size as the question text.

Three CSS mistakes worth not repeating, all the same root cause of setting a value to make one element look right without looking at the page: an arbitrary `max-width: 460px` on three separate blocks (this is what wrapped the four time buckets 3+1), `max-width: 16ch` on the h1, and a duplicate `.ice-label` rule appended below the original instead of merged into it.

Copy is Ruthnie's wording: headline "Answer three questions.", lede "Fill in the details about your meeting, then go to the next screen to see the suggested icebreakers." Button is "Run", not "Run this". Do not personify the tool or promise that it runs anything.

---

## Catalog direction — brain teasers (added 2026-08-20)

Ruthnie's read after browsing all 37: some are better than the curated results suggested (What Are You Bringing In?, Weather Check-In, Chat Waterfall — she's using Chat Waterfall on a real call), but the roster skews corny and there is a whole category missing.

**What's missing: brain teasers.** Trivia, logic puzzles, riddles. Things that make a team actually think. The specific ask:

- **Levels of complexity.** Not one difficulty. A range, so a team can be stretched or eased in.
- **Spread across the durations**, so a brain teaser is available whether there are 3 minutes or 25.
- **The point is anticipation.** People should walk into the meeting wondering what kind of teaser they're getting today. That is a different value from "we got to know each other" and it is the reason to build it.

This is a content pass, not a code pass. It needs its own session with the catalog file open. The existing 37 stay; this adds to them.

Open questions for that session, to answer while writing rather than before:

- Does a brain teaser need new fields? A `difficulty` (1-3?) is the obvious one, since `vulnerability` is meaningless for a logic puzzle and would be 1 across the board. Possibly an `answer` field, which nothing in the current schema has.
- Do they need their own category (`teasers`) and their own purpose tag, so the three-question flow can surface them and `/browse` can filter to just them?
- Does the intake need a fourth question or a refinement toggle for "give me a brain teaser"? Probably a refinement, since it should not compete with the three questions.

Also still open from earlier in this doc: the **closers gap** (one closer-tagged activity in the whole catalog). Same kind of content pass, and worth doing in the same session.
