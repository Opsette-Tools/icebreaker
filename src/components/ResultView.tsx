import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import type { Activity, Refinements } from "@/lib/catalog";
import ActivityMeta from "./ActivityMeta";

export default function ResultView({
  recommendation,
  alternates,
  placement,
  onPick,
  onStartOver,
}: {
  recommendation: Activity;
  alternates: Activity[];
  /** What was asked for, so a thin result can say WHY it is thin. */
  placement?: Refinements["purpose"];
  onPick: (activity: Activity) => void;
  onStartOver: () => void;
}) {
  // A single result for a placement is not a curated pick, it is the whole
  // shelf. Presenting it as a recommendation implies a choice was made among
  // several, and the catalog has one closer. Saying so is more useful than
  // letting someone assume the tool weighed options it never had.
  const onlyOption = alternates.length === 0 && placement !== undefined;
  return (
    <section>
      <button type="button" className="ice-more" onClick={onStartOver}>
        ← Change the answers
      </button>

      <article className="ice-recommendation">
        <Typography.Title level={2} style={{ marginTop: 8, marginBottom: 6 }}>
          {recommendation.name}
        </Typography.Title>
        <ActivityMeta activity={recommendation} />

        <Typography.Paragraph className="ice-blurb">{recommendation.blurb}</Typography.Paragraph>
        <Typography.Paragraph className="ice-why">{recommendation.why}</Typography.Paragraph>

        <Button type="primary" size="large" onClick={() => onPick(recommendation)}>
          Run
        </Button>
      </article>

      {onlyOption ? (
        <p className="ice-note" style={{ marginTop: 22 }}>
          <strong>This is the only one that fits.</strong> The catalog is thin on{" "}
          {placement === "closer"
            ? "closers"
            : placement === "reset"
              ? "mid-meeting resets"
              : "openers"}
          , so there is nothing to compare it against yet.
        </p>
      ) : null}

      {alternates.length > 0 ? (
        <section className="ice-alternates">
          <h3 className="ice-alternates-heading">Or</h3>
          {alternates.map((a) => (
            <button key={a.id} type="button" className="ice-alternate" onClick={() => onPick(a)}>
              <span className="ice-alternate-name">{a.name}</span>
              <span className="ice-alternate-blurb">{a.blurb}</span>
              <ActivityMeta activity={a} />
            </button>
          ))}
        </section>
      ) : null}

      <p className="ice-browse-link">
        <Link to="/browse">Browse all icebreakers</Link>
      </p>
    </section>
  );
}
