import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "antd";
import AppShell from "@/components/AppShell";
import InstrumentScreen from "@/facilitator/InstrumentScreen";
import { activityById } from "@/lib/catalog";

/**
 * The instrument screen at a real URL, so it can be opened in its own window
 * and dragged onto the shared display. Chrome only offers "open in new tab" on
 * an actual link, which is why the in-page button alone wasn't enough.
 */
export default function Tools() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activity = id ? activityById(id) : undefined;

  if (!activity) {
    return (
      <AppShell>
        <Typography.Title level={2}>Nothing here</Typography.Title>
        <Typography.Paragraph>That icebreaker doesn't exist.</Typography.Paragraph>
      </AppShell>
    );
  }

  // Opened in its own window there is nothing to go back to, so closing just
  // returns to the activity rather than unwinding history.
  return <InstrumentScreen activity={activity} onExit={() => navigate("/browse")} />;
}
