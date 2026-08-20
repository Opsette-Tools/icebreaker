import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A countdown the facilitator controls.
 *
 * Deadline-based, not tick-based: it stores the wall-clock time the phase ends
 * and derives the remaining seconds from it. An interval that decrements a
 * counter drifts, and browsers throttle timers in background tabs, so a
 * 6-minute phase would finish visibly late while the facilitator is sharing
 * another window. Reading the clock each tick means the display is right even
 * if ticks were missed.
 */
export function useCountdown(seconds: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  // When running, the wall-clock ms at which this phase ends.
  const deadline = useRef<number | null>(null);
  // Held in a ref so the interval effect doesn't restart when the caller passes
  // a new inline function each render.
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  // A new phase resets the clock.
  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
    deadline.current = null;
  }, [seconds]);

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      if (deadline.current === null) return;
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        deadline.current = null;
        completeRef.current?.();
      }
    };

    // Tick immediately so starting the timer updates the display without a
    // one-second pause.
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    setRemaining((left) => {
      const from = left > 0 ? left : seconds;
      deadline.current = Date.now() + from * 1000;
      return from;
    });
    setRunning(true);
  }, [seconds]);

  const pause = useCallback(() => {
    setRunning(false);
    deadline.current = null;
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    deadline.current = null;
    setRemaining(seconds);
  }, [seconds]);

  const toggle = useCallback(() => {
    if (running) pause();
    else start();
  }, [running, pause, start]);

  return { remaining, running, start, pause, reset, toggle };
}

/** m:ss, or h:mm:ss if a phase ever runs past an hour. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
