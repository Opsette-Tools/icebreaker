import { useState, type ReactNode } from "react";
import { Switch, Tooltip } from "antd";
import { ClockCircleOutlined, MoonOutlined, SunOutlined, TeamOutlined } from "@ant-design/icons";
import { OpsetteHeader } from "./opsette-header";
import HistoryDrawer from "./HistoryDrawer";
import AttendeesDrawer from "./AttendeesDrawer";
import { useTheme } from "@/hooks/use-theme";

/**
 * The chrome every route sits inside: shared header (which owns the share
 * button) plus the page frame.
 *
 * History is a drawer off the header rather than a route: it's a look at the
 * past, not a place you navigate to, and it should open over whatever you were
 * already reading instead of replacing it.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const [historyOpen, setHistoryOpen] = useState(false);
  const [attendeesOpen, setAttendeesOpen] = useState(false);

  return (
    <>
      <OpsetteHeader
        theme={isDark ? "dark" : "light"}
        rightExtra={
          // Order inside this slot, left to right: the shared header renders the
          // share button first, then theme, then a divider, then the two things
          // that belong to YOU rather than to the page — your attendees and
          // what you've run. Related controls grouped, groups separated.
          <span className="ice-header-actions">
            <span className="ice-header-theme">
              <SunOutlined style={{ fontSize: 13, opacity: isDark ? 0.45 : 0.9 }} />
              <Switch checked={isDark} onChange={toggle} size="small" />
              <MoonOutlined style={{ fontSize: 13, opacity: isDark ? 0.9 : 0.45 }} />
            </span>

            <span className="ice-header-divider" aria-hidden="true" />

            <Tooltip title="Your attendees">
              <button
                type="button"
                className="ice-header-btn"
                onClick={() => setAttendeesOpen(true)}
                aria-label="Your attendees"
              >
                <TeamOutlined />
              </button>
            </Tooltip>

            <Tooltip title="What you've run">
              <button
                type="button"
                className="ice-header-btn"
                onClick={() => setHistoryOpen(true)}
                aria-label="What you've run"
              >
                <ClockCircleOutlined />
              </button>
            </Tooltip>
          </span>
        }
      />
      <main className="ice-page">{children}</main>
      <AttendeesDrawer open={attendeesOpen} onClose={() => setAttendeesOpen(false)} />
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
