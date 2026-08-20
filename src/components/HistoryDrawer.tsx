import { useMemo, useState } from "react";
import { Button, Drawer, Empty, Popconfirm } from "antd";
import { clearHistory, getHistory, rateRun, type RunRating } from "@/lib/storage";

const FAMILIARITY_WORDS: Record<string, string> = {
  strangers: "hadn't met",
  colleagues: "not close",
  close: "tight team",
};

function whenWords(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

/**
 * What you've run, newest first, with the rating.
 *
 * The rating lives HERE rather than on a screen shown right after a run: you
 * don't know whether an icebreaker landed until the meeting has moved on, and
 * a prompt the moment it ends would get a reflexive answer. Rating from the
 * history list means answering when you actually know.
 */
export default function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Bumped on every mutation so the list re-reads storage.
  const [nonce, setNonce] = useState(0);
  // `nonce` is deliberately a dependency even though it is unused in the body:
  // getHistory() reads localStorage, which React cannot see, so bumping it is
  // what makes the list re-read after a rating or a clear.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runs = useMemo(() => (open ? getHistory() : []), [open, nonce]);

  function rate(id: string, rating: RunRating | null) {
    rateRun(id, rating);
    setNonce((n) => n + 1);
  }

  return (
    <Drawer
      title="What you've run"
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      extra={
        runs.length > 0 ? (
          <Popconfirm
            title="Clear the whole history?"
            description="Does not include your attendee list. This can't be undone."
            okText="Clear"
            cancelText="Keep"
            onConfirm={() => {
              clearHistory();
              setNonce((n) => n + 1);
            }}
          >
            <Button size="small">Clear</Button>
          </Popconfirm>
        ) : null
      }
    >
      {runs.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nothing yet. Show a question or start a timer and the run lands here."
        />
      ) : (
        <ul className="ice-history">
          {runs.map((r) => (
            <li key={r.id}>
              <div className="ice-history-top">
                <span className="ice-history-name">{r.activityName}</span>
                <span className="ice-history-when">{whenWords(r.ranAt)}</span>
              </div>
              <div className="ice-history-facts">
                {r.groupSize} {r.groupSize === 1 ? "person" : "people"} · {r.minutes} min ·{" "}
                {FAMILIARITY_WORDS[r.familiarity] ?? r.familiarity}
              </div>

              {r.prompt ? <p className="ice-history-prompt">"{r.prompt}"</p> : null}

              <div className="ice-rate">
                <button
                  type="button"
                  className={
                    r.rating === "worked" ? "ice-rate-btn ice-rate-btn--worked" : "ice-rate-btn"
                  }
                  aria-pressed={r.rating === "worked"}
                  onClick={() => rate(r.id, "worked")}
                >
                  Worked
                </button>
                <button
                  type="button"
                  className={
                    r.rating === "flopped" ? "ice-rate-btn ice-rate-btn--flopped" : "ice-rate-btn"
                  }
                  aria-pressed={r.rating === "flopped"}
                  onClick={() => rate(r.id, "flopped")}
                >
                  Flopped
                </button>
                {r.rating ? (
                  <button type="button" className="ice-more" onClick={() => rate(r.id, null)}>
                    Clear
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
