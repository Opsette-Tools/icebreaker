import { useState, type ReactNode } from "react";
import { Switch, Tooltip } from "antd";
import { ClockCircleOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { OpsetteHeader } from "./opsette-header";
import HistoryDrawer from "./HistoryDrawer";
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

  return (
    <>
      <OpsetteHeader
        theme={isDark ? "dark" : "light"}
        rightExtra={
          // Order inside this slot, left to right: the shared header renders the
          // share button first, then theme, then a divider, then history on the far
          // right. Related controls grouped, groups separated.
          <span className="ice-header-actions">
            <span className="ice-header-theme">
              <SunOutlined style={{ fontSize: 13, opacity: isDark ? 0.45 : 0.9 }} />
              <Switch checked={isDark} onChange={toggle} size="small" />
              <MoonOutlined style={{ fontSize: 13, opacity: isDark ? 0.9 : 0.45 }} />
            </span>

            <span className="ice-header-divider" aria-hidden="true" />

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
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
