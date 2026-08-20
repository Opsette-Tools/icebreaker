import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, DeckItem } from "@/lib/catalog";
import { fullDeck, splitDeck } from "@/lib/catalog";
import { getDeckCustom, getDeckUsed, saveDeckUsed } from "@/lib/storage";

/**
 * A stack of cards, drawn in random order, remembered across sessions.
 *
 * The draw order is the whole point, and it is why shipping a deck is worth
 * doing at all. A fixed list is a one-use feature: run the same activity every
 * week and by week six you are reading week six's riddle, which everyone can
 * see coming. Drawing without replacement, persisted, turns forty cards into
 * forty distinct weeks. The anticipation Ruthnie asked for ("what are we
 * getting today?") only survives if today is genuinely unknown.
 *
 * Used cards are remembered by TEXT rather than by index, because indexes move.
 * Adding one custom item at the top would otherwise shift every position by
 * one, silently re-serving cards already used and skipping ones never seen.
 *
 * The already-used idea is the same one the picker borrowed from Random Picker;
 * this differs in that it persists, since a roster round is one meeting and a
 * deck is meant to last a year.
 */
export function useDeck(activity: Activity) {
  const [customText, setCustomText] = useState(() => getDeckCustom(activity.id));
  const [used, setUsed] = useState<string[]>(() => getDeckUsed(activity.id));
  const [current, setCurrent] = useState<DeckItem | null>(null);
  const [revealed, setRevealed] = useState(false);

  const deck = useMemo(() => fullDeck(activity, customText), [activity, customText]);

  // Switching activities inside one mounted screen must not carry a card over.
  useEffect(() => {
    setCustomText(getDeckCustom(activity.id));
    setUsed(getDeckUsed(activity.id));
    setCurrent(null);
    setRevealed(false);
  }, [activity.id]);

  useEffect(() => {
    saveDeckUsed(activity.id, used);
  }, [activity.id, used]);

  const remaining = useMemo(() => deck.filter((card) => !used.includes(card.item)), [deck, used]);

  /**
   * The facilitator's own cards, unused, drawn from before the shipped stock.
   * Cards someone wrote for today's meeting are a deliberate choice; treating
   * them as a few more entries in a pile of fifty would mean most of the
   * meeting is shipped riddles and the ones they wrote rarely surface.
   */
  const pool = useMemo(() => {
    const { custom } = splitDeck(activity, customText);
    const customItems = new Set(custom.map((c) => c.item));
    const mine = remaining.filter((c) => customItems.has(c.item));
    return mine.length > 0 ? mine : remaining;
  }, [activity, customText, remaining]);

  const exhausted = deck.length > 0 && remaining.length === 0;

  const draw = useCallback(() => {
    if (pool.length === 0) return;
    const card = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(card);
    // Hiding the answer again on every draw is a correctness matter, not a
    // nicety: leaving it revealed would spoil the next card the instant it
    // lands, on a screen the whole room is watching.
    setRevealed(false);
    setUsed((prev) => (prev.includes(card.item) ? prev : [...prev, card.item]));
  }, [pool]);

  const reveal = useCallback(() => setRevealed(true), []);

  /**
   * Start the deck over. Deliberately manual: when the cards run out the screen
   * says so and waits, rather than looping straight back to a card the room
   * has already seen without anyone noticing it repeated.
   */
  const reshuffle = useCallback(() => {
    setUsed([]);
    setCurrent(null);
    setRevealed(false);
  }, []);

  return {
    deck,
    current,
    revealed,
    used,
    remaining,
    exhausted,
    customText,
    setCustomText,
    draw,
    reveal,
    reshuffle,
  };
}
