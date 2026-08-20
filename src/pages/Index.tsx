import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import IntakeForm, { type IntakeSubmit } from "@/components/IntakeForm";
import ResultView from "@/components/ResultView";
import ActivityDetail from "@/components/ActivityDetail";
import InstrumentScreen from "@/facilitator/InstrumentScreen";
import { filterActivities, type Activity } from "@/lib/catalog";
import { addRun, getLastIntake, saveIntake } from "@/lib/storage";
import { uuid } from "@/lib/uuid";

type Stage = "intake" | "results" | "detail" | "instruments";

export default function Index() {
  const [stage, setStage] = useState<Stage>("intake");
  const [query, setQuery] = useState<IntakeSubmit | null>(null);
  const [picked, setPicked] = useState<Activity | null>(null);
  const initialIntake = useMemo(() => getLastIntake(), []);

  const matches: Activity[] = useMemo(() => (query ? filterActivities(query) : []), [query]);

  function handleSubmit(value: IntakeSubmit) {
    saveIntake({
      groupSize: value.groupSize,
      minutes: value.minutes,
      familiarity: value.familiarity,
    });
    setQuery(value);
    setStage("results");
  }

  function handlePick(activity: Activity) {
    setPicked(activity);
    setStage("detail");
  }

  // Opening the tools is NOT running an icebreaker: you might open them, look,
  // and close. The run is logged from inside the tools, when the question goes
  // up or the clock starts.
  function logRun(prompt: string) {
    if (!picked || !query) return;
    addRun({
      id: uuid(),
      activityId: picked.id,
      activityName: picked.name,
      ranAt: new Date().toISOString(),
      groupSize: query.groupSize,
      minutes: query.minutes,
      familiarity: query.familiarity,
      prompt: prompt.trim() || undefined,
    });
  }
  if (stage === "instruments" && picked) {
    return (
      <InstrumentScreen activity={picked} onExit={() => setStage("detail")} onRunStarted={logRun} />
    );
  }

  return (
    <AppShell>
      {stage === "intake" ? (
        <>
          <Typography.Title level={1} className="ice-h1">
            Answer three questions.
          </Typography.Title>
          <Typography.Paragraph className="ice-lede">
            Fill in the details about your meeting, then go to the next screen to see the suggested
            icebreakers.
          </Typography.Paragraph>
          <IntakeForm initial={initialIntake} onSubmit={handleSubmit} />
        </>
      ) : null}

      {stage === "detail" && picked && query ? (
        <ActivityDetail
          activity={picked}
          familiarity={query.familiarity}
          onOpenInstruments={() => setStage("instruments")}
          onMarkAsRun={() => logRun("")}
          onBack={() => setStage("results")}
        />
      ) : null}

      {stage === "results" ? (
        matches.length > 0 ? (
          <ResultView
            recommendation={matches[0]}
            alternates={matches.slice(1, 4)}
            onPick={handlePick}
            onStartOver={() => setStage("intake")}
          />
        ) : (
          <section>
            <button type="button" className="ice-more" onClick={() => setStage("intake")}>
              ← Change the answers
            </button>
            <Typography.Title level={2}>Nothing fits that.</Typography.Title>
            <Typography.Paragraph>
              Try giving it another couple of minutes, or turn off camera-optional if you had it on.
            </Typography.Paragraph>
          </section>
        )
      ) : null}

      <footer className="ice-footer">
        <Link to="/browse">Every icebreaker</Link>
        <span aria-hidden="true">·</span>
        <Link to="/about">About</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacy">Privacy</Link>
      </footer>
    </AppShell>
  );
}
