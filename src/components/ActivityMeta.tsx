import { Tag } from "antd";
import { ClockCircleOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import type { Activity } from "@/lib/catalog";
import { instrumentsFor } from "@/lib/catalog";

/**
 * The at-a-glance facts: size, length, what the group needs to bring, and what
 * the tool provides.
 *
 * That last part is the distinction worth keeping straight. `materials` is what
 * the PARTICIPANTS need (paper, a webcam). The instrument tags are what the
 * TOOL hands the facilitator, which is otherwise invisible until you open an
 * activity.
 */
const INSTRUMENT_LABELS = {
  timer: { text: "Timer", icon: <ClockCircleOutlined /> },
  prompt: { text: "Question", icon: <MessageOutlined /> },
  picker: { text: "Picker", icon: <UserOutlined /> },
} as const;

export default function ActivityMeta({ activity }: { activity: Activity }) {
  const instruments = instrumentsFor(activity);

  return (
    <div className="ice-meta">
      <span>
        {activity.min}–{activity.max} people
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {activity.minMinutes}–{activity.maxMinutes} min
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {activity.materials.length === 0 ? "Nothing needed" : activity.materials.join(", ")}
      </span>

      {activity.virtual === "adapted" ? (
        <Tag color="blue" style={{ marginInlineStart: 4 }}>
          Adapted for video
        </Tag>
      ) : null}
      {activity.physicality === "camera" ? <Tag>Camera on</Tag> : null}
      {activity.physicality === "light" ? <Tag>Some movement</Tag> : null}

      {instruments.map((kind) => (
        <span key={kind} className="ice-instrument-tag">
          {INSTRUMENT_LABELS[kind].icon}
          {INSTRUMENT_LABELS[kind].text}
        </span>
      ))}
    </div>
  );
}
