import { Button, Typography } from "antd";
import { Link } from "react-router-dom";
import type { Activity } from "@/lib/catalog";
import ActivityMeta from "./ActivityMeta";

export default function ResultView({
  recommendation,
  alternates,
  onPick,
  onStartOver,
}: {
  recommendation: Activity;
  alternates: Activity[];
  onPick: (activity: Activity) => void;
  onStartOver: () => void;
}) {
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
        <Link to="/browse">See every icebreaker</Link>
      </p>
    </section>
  );
}
