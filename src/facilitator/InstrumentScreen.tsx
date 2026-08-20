import { useEffect, useMemo, useRef, useState } from "react";
import { App as AntdApp, Button, Input } from "antd";
import type { Activity } from "@/lib/catalog";
import { instrumentsFor } from "@/lib/catalog";
import { getPrompt, getRoster, savePrompt, saveRoster } from "@/lib/storage";
import { canMakeSlide, copyText, toSlideText } from "@/lib/export";
import { formatClock, useCountdown } from "./use-countdown";
import { usePicker } from "./use-picker";

/**
 * Everything that DOES something during the run, on one screen, shareable.
 *
 * The split that got this right: the detail page is what you READ, this is
 * what you OPERATE. Instructions never appear here, because this window is the
 * one on the shared display and stage directions have no business there.
 */
export default function InstrumentScreen({
  activity,
  onExit,
  onRunStarted,
}: {
  activity: Activity;
  onExit: () => void;
  /**
   * Fired the first time something actually happens: the question goes up, or
   * the clock starts. NOT on open. Opening the tools to look at them is not
   * running an icebreaker, and logging it there filled the history with runs
   * that never happened.
   */
  onRunStarted: (prompt: string) => void;
}) {
  const kinds = useMemo(() => instrumentsFor(activity), [activity]);
  const phases = useMemo(() => activity.timerPhases ?? [], [activity]);
  const [phaseAt, setPhaseAt] = useState(0);
  const phase = phases[phaseAt];

  const { remaining, running, toggle, reset } = useCountdown(phase?.seconds ?? 0);

  const [prompt, setPrompt] = useState(() => getPrompt(activity.id));
  // Explicit editing state. Deriving it from  being empty unmounted the
  // textarea on the FIRST keystroke, so only one character could ever be typed.
  const [editingPrompt, setEditingPrompt] = useState(() => getPrompt(activity.id).trim() === "");
  const [rosterText, setRosterText] = useState(() => getRoster());
  // Explicit, for the same reason as editingPrompt: deriving this from
  // names.length unmounted the textarea on the first keystroke.
  const [editingRoster, setEditingRoster] = useState(() => getRoster().trim() === "");
  const names = useMemo(
    () =>
      rosterText
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    [rosterText],
  );
  const picker = usePicker(names);
  const { message } = AntdApp.useApp();
  const logged = useRef(false);

  function markRun(withPrompt: string) {
    if (logged.current) return;
    logged.current = true;
    onRunStarted(withPrompt);
  }

  async function copySlide() {
    const ok = await copyText(toSlideText(activity, prompt));
    if (ok) message.success("Slide copied");
    else message.error("Could not copy. Your browser blocked clipboard access.");
  }

  useEffect(() => {
    saveRoster(rosterText);
  }, [rosterText]);

  useEffect(() => {
    savePrompt(activity.id, prompt);
  }, [activity.id, prompt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never hijack keys while the facilitator is typing into the prompt or the
      // roster. Space would otherwise toggle the clock instead of inserting a
      // space, so a typed question came out with every word run together.
      const el = e.target as HTMLElement | null;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el?.isContentEditable === true;
      if (typing) return;

      if (e.key === "Escape") {
        onExit();
        return;
      }
      if (e.code === "Space" && phase) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, toggle, phase]);

  // Screen-share means long stretches with nobody touching the keyboard.
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    let released = false;
    navigator.wakeLock
      ?.request("screen")
      .then((s) => {
        if (released) void s.release();
        else sentinel = s;
      })
      .catch(() => {
        /* denied or unsupported */
      });
    return () => {
      released = true;
      void sentinel?.release();
    };
  }, []);

  const done = phase ? remaining === 0 : false;

  return (
    <div className="ice-inst">
      <header className="ice-inst-head">
        <span className="ice-inst-title">{activity.name}</span>
        <button type="button" className="ice-run-exit" onClick={onExit}>
          Close
        </button>
      </header>

      <div className="ice-inst-body">
        {kinds.includes("prompt") ? (
          <section className="ice-inst-prompt">
            {editingPrompt ? (
              <>
                <Input.TextArea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onPressEnter={(e) => {
                    // Enter commits; Shift+Enter keeps the newline.
                    if (!e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim()) {
                        setEditingPrompt(false);
                        markRun(prompt);
                      }
                    }
                  }}
                  placeholder="Type the question the group is answering. It stays on screen."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="ice-inst-prompt-input"
                  autoFocus
                />
                <Button
                  type="primary"
                  onClick={() => {
                    setEditingPrompt(false);
                    markRun(prompt);
                  }}
                  disabled={!prompt.trim()}
                  style={{ marginTop: 12 }}
                >
                  Show it
                </Button>
              </>
            ) : (
              <>
                <p className="ice-inst-prompt-text">{prompt}</p>
                <div className="ice-inst-prompt-actions">
                  <button type="button" className="ice-more" onClick={() => setEditingPrompt(true)}>
                    Change the question
                  </button>
                  {canMakeSlide(prompt) ? (
                    <Button size="small" onClick={copySlide}>
                      Copy slide
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </section>
        ) : null}

        {phase ? (
          <section className="ice-inst-timer">
            {phases.length > 1 ? (
              <div className="ice-inst-phases">
                {phases.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className={
                      i === phaseAt ? "ice-phase-chip ice-phase-chip--on" : "ice-phase-chip"
                    }
                    onClick={() => setPhaseAt(i)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="ice-inst-phase-label">{phase.label}</p>
            )}

            <p className={done ? "ice-clock ice-clock--done" : "ice-clock"} aria-live="polite">
              {formatClock(remaining)}
            </p>

            {done ? <p className="ice-inst-done-word">Time</p> : null}

            <div className="ice-run-timer-controls">
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  toggle();
                  markRun(prompt);
                }}
                disabled={done}
              >
                {running ? "Pause" : remaining < phase.seconds ? "Resume" : "Start"}
              </Button>
              <Button size="large" onClick={reset}>
                Reset
              </Button>
              {phaseAt < phases.length - 1 ? (
                <Button size="large" onClick={() => setPhaseAt((i) => i + 1)}>
                  Next phase →
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {kinds.includes("picker") ? (
          <section className="ice-inst-picker">
            {editingRoster ? (
              <>
                <Input.TextArea
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                  placeholder="Meeting attendee names, one per line. Shared across every icebreaker."
                  autoSize={{ minRows: 4, maxRows: 10 }}
                  className="ice-inst-roster-input"
                  autoFocus
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setEditingRoster(false)}
                  disabled={names.length === 0}
                  style={{ marginTop: 12 }}
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                {picker.pairs ? (
                  <ol className="ice-inst-pairs">
                    {picker.pairs.map((pair, i) => (
                      <li key={i}>{pair.join("  ·  ")}</li>
                    ))}
                  </ol>
                ) : (
                  <p
                    className={
                      picker.spinning ? "ice-inst-name ice-inst-name--spin" : "ice-inst-name"
                    }
                  >
                    {picker.display ?? "—"}
                  </p>
                )}

                <div className="ice-run-timer-controls">
                  <Button
                    type="primary"
                    size="large"
                    onClick={picker.pickNext}
                    disabled={picker.spinning}
                  >
                    {picker.current ? "Next person" : "Who goes first"}
                  </Button>
                  <Button size="large" onClick={picker.makePairs} disabled={names.length < 2}>
                    Make pairs
                  </Button>
                  <Button size="large" onClick={picker.resetRound}>
                    Reset
                  </Button>
                </div>

                <p className="ice-run-hint">
                  {picker.remaining.length} of {names.length} still to go ·{" "}
                  <button type="button" className="ice-more" onClick={() => setEditingRoster(true)}>
                    Edit the list
                  </button>
                </p>
              </>
            )}
          </section>
        ) : null}
      </div>

      {phase ? (
        <p className="ice-run-hint ice-inst-foot">Space starts and stops the clock.</p>
      ) : null}
    </div>
  );
}
