import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input, Segmented, Typography } from "antd";
import AppShell from "@/components/AppShell";
import ActivityMeta from "@/components/ActivityMeta";
import ActivityDetail from "@/components/ActivityDetail";
import InstrumentScreen from "@/facilitator/InstrumentScreen";
import { ACTIVITIES, hasDebrief, hasDeck, instrumentsFor, type Activity } from "@/lib/catalog";
import { addRun, getLastIntake } from "@/lib/storage";
import { uuid } from "@/lib/uuid";

const CATEGORY_LABELS: Record<string, string> = {
  meetings: "Meetings",
  quick: "Quick",
  virtual: "Virtual",
  "know-each-other": "Getting to know each other",
  fun: "Fun",
  deeper: "Deeper",
  teamwork: "Teamwork",
  large: "Large groups",
  small: "Small groups",
  closers: "Closers",
};

const CATEGORIES = Array.from(new Set(ACTIVITIES.map((a) => a.category)));

/**
 * Traits you cannot see from a list. Each carries its own predicate so the
 * count on the chip and the filtering below are the same function — a count
 * that disagreed with the list it produces would be worse than no count.
 */
const TRAITS: { value: string; label: string; test: (a: Activity) => boolean }[] = [
  { value: "debrief", label: "Ends on a question", test: (a) => hasDebrief(a) },
  {
    value: "closer",
    label: "Closes the meeting",
    test: (a) => a.purpose.some((p) => p === "close" || p === "check-out"),
  },
  { value: "cards", label: "Has cards", test: (a) => hasDeck(a) },
  { value: "nothing", label: "No tools needed", test: (a) => instrumentsFor(a).length === 0 },
];

export default function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  /**
   * Traits you cannot see from a list, each of which was previously invisible
   * until you opened an activity one at a time. The closing question is the
   * sharpest: 20 of 37 end on a real question and 17 deliberately do not, which
   * is a genuine split with no way to browse by it.
   */
  const [trait, setTrait] = useState<string>("any");
  const [picked, setPicked] = useState<Activity | null>(null);
  const [running, setRunning] = useState(false);
  // Browse has no intake of its own, so a run started here uses the last
  // answers if there are any. The familiarity is what the warning reads.
  const lastIntake = useMemo(() => getLastIntake(), []);
  const groupSize = lastIntake?.groupSize ?? 8;
  const minutes = lastIntake?.minutes ?? 10;

  function logRun(prompt: string) {
    if (!picked) return;
    addRun({
      id: uuid(),
      activityId: picked.id,
      activityName: picked.name,
      ranAt: new Date().toISOString(),
      groupSize,
      minutes,
      familiarity: lastIntake?.familiarity ?? "colleagues",
      prompt: prompt.trim() || undefined,
    });
  }
  /**
   * Everything the search box and the category bar allow, BEFORE the trait
   * chips narrow it further.
   *
   * Split out so the chip counts can be computed against it. Counting over the
   * whole catalog instead made the chips lie: searching "emoji" showed a single
   * result while "No tools needed" still promised 6, because the count never
   * saw the search. A count that disagrees with the list it produces is worse
   * than no count.
   */
  const base: Activity[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ACTIVITIES.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.blurb.toLowerCase().includes(q) ||
        a.why.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  const shown: Activity[] = useMemo(() => {
    const active = TRAITS.find((t) => t.value === trait);
    return active ? base.filter(active.test) : base;
  }, [base, trait]);

  if (running && picked) {
    return (
      <InstrumentScreen activity={picked} onExit={() => setRunning(false)} onRunStarted={logRun} />
    );
  }

  if (picked) {
    return (
      <AppShell>
        <ActivityDetail
          activity={picked}
          familiarity={lastIntake?.familiarity ?? "colleagues"}
          onOpenInstruments={() => setRunning(true)}
          onMarkAsRun={() => logRun("")}
          onBack={() => setPicked(null)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link to="/" className="ice-more">
        ← Back
      </Link>

      <Typography.Title level={1} className="ice-h1" style={{ marginTop: 16 }}>
        Browse icebreakers
      </Typography.Title>
      <Input.Search
        placeholder="Search"
        allowClear
        size="large"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 18 }}
      />

      <div style={{ overflowX: "auto", marginBottom: 26, paddingBottom: 4 }}>
        <Segmented
          value={category}
          onChange={(v) => setCategory(v as string)}
          options={[
            { label: "All", value: "all" },
            ...CATEGORIES.map((c) => ({ label: CATEGORY_LABELS[c] ?? c, value: c })),
          ]}
        />
      </div>

      {/*
       * Traits are deliberately NOT a second Segmented bar. Two identical
       * full-width slabs stacked on each other read as one confusing control,
       * and they are not the same kind of question: category is what kind of
       * activity this is, a trait is what it comes with. Chips carry a count,
       * so the row also answers "is there anything behind this" before you
       * spend a click finding out there is one closer.
       */}
      <div className="ice-traits">
        {TRAITS.map((t) => {
          const count = base.filter(t.test).length;
          const on = trait === t.value;
          // A chip that would return nothing says so and refuses the click,
          // rather than letting someone land on an empty list.
          const dead = count === 0 && !on;
          return (
            <button
              key={t.value}
              type="button"
              className={
                on ? "ice-trait ice-trait--on" : dead ? "ice-trait ice-trait--dead" : "ice-trait"
              }
              aria-pressed={on}
              disabled={dead}
              onClick={() => setTrait(on ? "any" : t.value)}
            >
              {t.label}
              <span className="ice-trait-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/*
       * The only count on the page, and it tracks the filters. There was a
       * hardcoded "All 37 of them, unfiltered" under the title that sat
       * directly above this one and disagreed with it the moment anything was
       * filtered.
       */}
      <Typography.Paragraph type="secondary" style={{ fontSize: 14 }}>
        {shown.length} of {ACTIVITIES.length}
      </Typography.Paragraph>

      {shown.map((a) => (
        <button key={a.id} type="button" className="ice-browse-row" onClick={() => setPicked(a)}>
          <span className="ice-alternate-name">{a.name}</span>
          <span className="ice-alternate-blurb">{a.blurb}</span>
          <ActivityMeta activity={a} />
          <span className="ice-browse-why">{a.why}</span>
        </button>
      ))}

      {shown.length === 0 ? (
        <Typography.Paragraph>
          {trait === "closer"
            ? "The catalog has one activity whose job is to end a meeting, and it is not in this category."
            : "Nothing matches that search."}
        </Typography.Paragraph>
      ) : null}
    </AppShell>
  );
}
