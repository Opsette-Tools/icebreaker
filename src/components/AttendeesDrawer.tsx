import { useEffect, useMemo, useState } from "react";
import { Button, Popconfirm, Typography } from "antd";
import { Drawer } from "antd";
import { getRoster, parseNames, saveRoster } from "@/lib/storage";
import RosterField from "./RosterField";

/**
 * Your team, in one place, editable without opening an activity.
 *
 * The roster was already global — one list every picker draws from — but the
 * only way to see or change it was to open an activity that happens to have a
 * picker and edit it inside the tool screen. That made a global thing look
 * local, and it left Clear History promising to preserve an attendee list the
 * user had no way to look at.
 *
 * A drawer off the header for the same reason history is one: it belongs to
 * you rather than to the page you're on, and it should open over whatever you
 * were reading instead of replacing it.
 */
export default function AttendeesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");

  // Re-read on open. The instrument screen writes to the same key, so a roster
  // edited during a run would otherwise show stale here.
  useEffect(() => {
    if (open) setText(getRoster());
  }, [open]);

  const names = useMemo(() => parseNames(text), [text]);

  return (
    <Drawer
      title="Your attendees"
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      extra={
        names.length > 0 ? (
          <Popconfirm
            title="Remove everyone?"
            description="Clears the list for every icebreaker. This can't be undone."
            okText="Remove"
            cancelText="Keep"
            onConfirm={() => {
              setText("");
              saveRoster("");
            }}
          >
            <Button size="small">Clear</Button>
          </Popconfirm>
        ) : null
      }
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 14 }}>
        This is the list every icebreaker draws from when it picks who goes next or makes pairs, so
        changing it here changes it everywhere. It stays on this device, and clearing your run
        history leaves it alone.
      </Typography.Paragraph>

      <RosterField value={text} onChange={setText} minRows={8} maxRows={20} />
    </Drawer>
  );
}
