import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input, Segmented, Typography } from "antd";
import AppShell from "@/components/AppShell";
import ActivityMeta from "@/components/ActivityMeta";
import ActivityDetail from "@/components/ActivityDetail";
import InstrumentScreen from "@/facilitator/InstrumentScreen";
import { ACTIVITIES, type Activity } from "@/lib/catalog";
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

export default function Browse() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
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
  const shown: Activity[] = useMemo(() => {
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
        Every icebreaker
      </Typography.Title>
      <Typography.Paragraph className="ice-lede">
        All {ACTIVITIES.length} of them, unfiltered.
      </Typography.Paragraph>

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

      <Typography.Paragraph type="secondary" style={{ fontSize: 14 }}>
        {shown.length} {shown.length === 1 ? "activity" : "activities"}
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
        <Typography.Paragraph>Nothing matches that search.</Typography.Paragraph>
      ) : null}
    </AppShell>
  );
}
