import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Who goes next, and who's paired with whom.
 *
 * Two ideas borrowed from the Random Picker tool (`c:/Opsette Tools/random-picker`,
 * `src/hooks/usePicker.ts`): an "already picked" list so a round-robin never
 * repeats until everyone has gone, and a short shuffle animation before the
 * result lands, which buys the anticipation that makes a room watch.
 *
 * Not borrowed: its textarea-of-items model, its own localStorage keys, and its
 * presets. This one is narrow on purpose. A roster of names typed once, then
 * either "next" or "pair everyone up".
 */

const SHUFFLE_STEPS = 14;

export function usePicker(names: string[]) {
  // Joined into a scalar so the reset effect has a statically checkable
  // dependency. A new array identity every render would reset on every render.
  const rosterKey = names.join("||");

  const [picked, setPicked] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [pairs, setPairs] = useState<string[][] | null>(null);
  const timer = useRef<number | null>(null);

  // Editing the roster invalidates everything derived from it.
  useEffect(() => {
    setPicked([]);
    setCurrent(null);
    setDisplay(null);
    setPairs(null);
  }, [rosterKey]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const remaining = names.filter((n) => !picked.includes(n));

  const pickNext = useCallback(() => {
    if (spinning) return;
    const pool = remaining.length > 0 ? remaining : names;
    if (pool.length === 0) return;
    // Everyone has gone: start the round over rather than refusing.
    const startingOver = remaining.length === 0;

    setSpinning(true);
    setPairs(null);
    const landed = pool[Math.floor(Math.random() * pool.length)];

    let step = 0;
    const tick = () => {
      if (step < SHUFFLE_STEPS) {
        setDisplay(pool[Math.floor(Math.random() * pool.length)]);
        step++;
        // Decelerating, so it visibly settles instead of stopping dead.
        timer.current = window.setTimeout(tick, 40 + step * 16);
      } else {
        setDisplay(landed);
        setCurrent(landed);
        setPicked((prev) => (startingOver ? [landed] : [...prev, landed]));
        setSpinning(false);
      }
    };
    tick();
  }, [remaining, names, spinning]);

  const makePairs = useCallback(() => {
    if (names.length < 2) return;
    const shuffled = names.slice();
    // Fisher-Yates. A naive sort(() => Math.random() - 0.5) is biased and, on a
    // small roster, visibly favours the original order.
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const out: string[][] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      out.push(shuffled.slice(i, i + 2));
    }
    // An odd roster leaves a trailing single. Fold them into the last pair so
    // nobody is left without a partner.
    if (out.length > 1 && out[out.length - 1].length === 1) {
      const last = out.pop()!;
      out[out.length - 1].push(last[0]);
    }
    setPairs(out);
    setCurrent(null);
    setDisplay(null);
  }, [names]);

  const resetRound = useCallback(() => {
    setPicked([]);
    setCurrent(null);
    setDisplay(null);
    setPairs(null);
  }, []);

  return {
    current,
    display,
    spinning,
    picked,
    remaining,
    pairs,
    pickNext,
    makePairs,
    resetRound,
  };
}
