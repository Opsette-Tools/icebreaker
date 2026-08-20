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
          {/*
           * No count, and no sentence explaining the form. It said "Answer
           * three questions." and was wrong the moment a fourth was promoted
           * into the flow; the instructional rewrite that replaced it just said
           * the same thing at length, with the form sitting right below it. A
           * number here drifts, and prose here is redundant.
           */}
          <Typography.Title level={2} className="ice-intake-heading">
            Fill in meeting details
          </Typography.Title>
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

      {stage === "results" && query ? (
        matches.length > 0 ? (
          <ResultView
            recommendation={matches[0]}
            alternates={matches.slice(1, 4)}
            placement={query.purpose}
            onPick={handlePick}
            onStartOver={() => setStage("intake")}
          />
        ) : (
          <section>
            <button type="button" className="ice-more" onClick={() => setStage("intake")}>
              ← Change the answers
            </button>
            <Typography.Title level={2}>Nothing fits that.</Typography.Title>
            {/*
             * Name the constraint that actually emptied the result. The old
             * copy always suggested adding time, which is useless advice when
             * the cause is a group of 80 asking for a closer: no amount of
             * time fixes a size ceiling, and the catalog has one closer.
             */}
            <Typography.Paragraph>
              {query.purpose === "closer" || query.purpose === "reset"
                ? `The catalog has very few ${
                    query.purpose === "closer" ? "closers" : "mid-meeting resets"
                  }, and none of them fit a group of ${query.groupSize}. Try "Anywhere" for where it sits.`
                : "Try giving it another couple of minutes, or turn off camera-optional if you had it on."}
            </Typography.Paragraph>
          </section>
        )
      ) : null}

      <footer className="ice-footer">
        <Link to="/browse">Browse icebreakers</Link>
        <span aria-hidden="true">·</span>
        <Link to="/about">About</Link>
        <span aria-hidden="true">·</span>
        <Link to="/privacy">Privacy</Link>
      </footer>
    </AppShell>
  );
}
