import { Tag } from "antd";
import type { Activity } from "@/lib/catalog";

/** The at-a-glance facts: size, length, what's needed, how it runs on a call. */
export default function ActivityMeta({ activity }: { activity: Activity }) {
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
    </div>
  );
}
