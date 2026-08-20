import { useState } from "react";
import { Button, InputNumber, Segmented } from "antd";
import type { Familiarity, Intake } from "@/lib/storage";
import { TIME_BUCKETS, type Refinements } from "@/lib/catalog";

const FAMILIARITY_OPTIONS: { label: string; value: Familiarity }[] = [
  { label: "They've never met", value: "strangers" },
  { label: "They work together but aren't close", value: "colleagues" },
  { label: "Tight team, been together a while", value: "close" },
];

export type IntakeSubmit = Intake & Refinements;

export default function IntakeForm({
  initial,
  onSubmit,
}: {
  initial: Intake | null;
  onSubmit: (value: IntakeSubmit) => void;
}) {
  const [groupSize, setGroupSize] = useState<number>(initial?.groupSize ?? 8);
  const [minutes, setMinutes] = useState<number>(initial?.minutes ?? 10);
  const [familiarity, setFamiliarity] = useState<Familiarity>(initial?.familiarity ?? "colleagues");

  const [showMore, setShowMore] = useState(false);
  const [energy, setEnergy] = useState<Refinements["energy"]>(undefined);
  const [purpose, setPurpose] = useState<Refinements["purpose"]>(undefined);
  const [cameraOptional, setCameraOptional] = useState(false);

  return (
    <section>
      <div className="ice-question">
        <label className="ice-label" htmlFor="group-size">
          <span className="ice-num">1.</span>
          How many people?
        </label>
        <InputNumber
          id="group-size"
          min={1}
          max={500}
          value={groupSize}
          onChange={(v) => setGroupSize(v ?? 1)}
          style={{ width: 110 }}
        />
      </div>

      <div className="ice-question">
        <span className="ice-label">
          <span className="ice-num">2.</span>
          How long have you got?
        </span>
        <div className="ice-buckets">
          {TIME_BUCKETS.map((bucket) => (
            <button
              key={bucket.cap}
              type="button"
              className={minutes === bucket.cap ? "ice-choice ice-choice--on" : "ice-choice"}
              aria-pressed={minutes === bucket.cap}
              onClick={() => setMinutes(bucket.cap)}
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ice-question">
        <span className="ice-label">
          <span className="ice-num">3.</span>
          How well do they know each other?
        </span>
        <div className="ice-familiarity">
          {FAMILIARITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={familiarity === opt.value ? "ice-choice ice-choice--on" : "ice-choice"}
              aria-pressed={familiarity === opt.value}
              onClick={() => setFamiliarity(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showMore ? (
        <div className="ice-refinements">
          <div className="ice-question">
            <span className="ice-label ice-label--small">Energy</span>
            <Segmented
              value={energy ?? "any"}
              onChange={(v) =>
                setEnergy(v === "any" ? undefined : (v as NonNullable<Refinements["energy"]>))
              }
              options={[
                { label: "No preference", value: "any" },
                { label: "Wake them up", value: "up" },
                { label: "Settle them down", value: "down" },
              ]}
            />
          </div>

          <div className="ice-question">
            <span className="ice-label ice-label--small">Where it sits in the meeting</span>
            <Segmented
              value={purpose ?? "any"}
              onChange={(v) =>
                setPurpose(v === "any" ? undefined : (v as NonNullable<Refinements["purpose"]>))
              }
              options={[
                { label: "No preference", value: "any" },
                { label: "Opener", value: "opener" },
                { label: "Mid-meeting reset", value: "reset" },
                { label: "Closer", value: "closer" },
              ]}
            />
          </div>

          <div className="ice-question">
            <label className="ice-checkbox">
              <input
                type="checkbox"
                checked={cameraOptional}
                onChange={(e) => setCameraOptional(e.target.checked)}
              />
              <span>
                Keep it camera-optional
                <span className="ice-hint">
                  Nobody has to be seen or move. Leaves out anything that assumes both.
                </span>
              </span>
            </label>
          </div>
        </div>
      ) : (
        <button type="button" className="ice-more" onClick={() => setShowMore(true)}>
          More options
        </button>
      )}

      <div style={{ marginTop: 24 }}>
        <Button
          type="primary"
          onClick={() =>
            onSubmit({ groupSize, minutes, familiarity, energy, purpose, cameraOptional })
          }
        >
          Find one
        </Button>
      </div>
    </section>
  );
}
