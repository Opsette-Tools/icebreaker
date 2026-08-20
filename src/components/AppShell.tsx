import type { ReactNode } from "react";
import { Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { OpsetteHeader } from "./opsette-header";
import { useTheme } from "@/hooks/use-theme";

/**
 * The chrome every route sits inside: shared header (which owns the share
 * button) plus the page frame. Workspace controls belong in the page content,
 * not in rightExtra — the header is chrome.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <OpsetteHeader
        theme={isDark ? "dark" : "light"}
        rightExtra={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <SunOutlined style={{ fontSize: 13, opacity: isDark ? 0.45 : 0.9 }} />
            <Switch checked={isDark} onChange={toggle} size="small" />
            <MoonOutlined style={{ fontSize: 13, opacity: isDark ? 0.9 : 0.45 }} />
          </span>
        }
      />
      <main className="ice-page">{children}</main>
    </>
  );
}
