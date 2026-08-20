import { Button, Typography } from "antd";
import type { Activity } from "@/lib/catalog";
import { VULNERABILITY_CEILING, hasDebrief, instrumentsFor } from "@/lib/catalog";
import type { Familiarity } from "@/lib/storage";
import { lastRunOf } from "@/lib/storage";
import ActivityMeta from "./ActivityMeta";

/** How long ago, in words a person would use. */
function sinceWords(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

/**
 * The host's sheet. Everything you read is here, on one page, in the order
 * you'd need it. It used to be chopped into full-screen slides, which was
 * wrong: these are instructions to the facilitator, so splitting them across
 * screens you have to click through helps nobody and puts stage directions on
 * a shared display.
 *
 * Nothing on this page moves. Anything that DOES something (timer, prompt,
 * picker) lives on the instrument screen instead.
 */
export default function ActivityDetail({
  activity,
  familiarity,
  onOpenInstruments,
  onBack,
}: {
  activity: Activity;
  familiarity: Familiarity;
  onOpenInstruments: () => void;
  onBack: () => void;
}) {
  // Warn, don't just filter. Reachable from /browse where nothing was filtered.
  const tooMuch = activity.vulnerability > VULNERABILITY_CEILING[familiarity];
  const previous = lastRunOf(activity.id);
  const instruments = instrumentsFor(activity);

  return (
    <section className="ice-detail">
      <button type="button" className="ice-more" onClick={onBack}>
        ← Back
      </button>

      <Typography.Title level={2} style={{ marginTop: 14, marginBottom: 6 }}>
        {activity.name}
      </Typography.Title>
      <ActivityMeta activity={activity} />

      <Typography.Paragraph className="ice-blurb">{activity.blurb}</Typography.Paragraph>
      <Typography.Paragraph className="ice-why">{activity.why}</Typography.Paragraph>

      {tooMuch ? (
        <p className="ice-note ice-note--warn">
          <strong>Heavier than this group may be ready for.</strong> It asks for real
          self-disclosure and you said they don't know each other well yet.
        </p>
      ) : null}

      {previous ? (
        <p className="ice-note">
          <strong>You ran this {sinceWords(previous.ranAt)}.</strong> Repeating one too soon is the
          fastest way to lose a room.
        </p>
      ) : null}

      {instruments.length > 0 ? (
        <div className="ice-detail-cta">
          <Button type="primary" size="large" onClick={onOpenInstruments}>
            Open the tools
          </Button>
          <a
            className="ice-more"
            href={`${import.meta.env.BASE_URL}tools/${activity.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in a separate window
          </a>
        </div>
      ) : null}

      <h3 className="ice-detail-heading">Steps</h3>
      <ol className="ice-detail-steps">
        {activity.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <div className="ice-detail-first">
        <h3 className="ice-detail-heading ice-detail-heading--accent">You go first</h3>
        <p className="ice-detail-body ice-detail-body--strong">{activity.facilitatorFirst}</p>
      </div>

      {activity.virtual === "adapted" ? (
        <>
          <h3 className="ice-detail-heading">On a video meeting</h3>
          <p className="ice-detail-body">{activity.virtualNote}</p>
        </>
      ) : null}

      <h3 className="ice-detail-heading">Watch out for</h3>
      <p className="ice-detail-body">{activity.safetyNote}</p>

      <h3 className="ice-detail-heading">{hasDebrief(activity) ? "Close with" : "Debrief"}</h3>
      <p
        className={
          hasDebrief(activity) ? "ice-detail-body ice-detail-body--strong" : "ice-detail-body"
        }
      >
        {activity.debrief}
      </p>
    </section>
  );
}
