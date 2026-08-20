import { theme as antdTheme, type ThemeConfig } from "antd";

// Icebreaker's accent is a cool slate-blue — ice, and restrained enough to sit
// inside the family's neutral rule. It is defined HERE and nowhere else; every
// surface reads it from this file or from the CSS variables in styles.css.
export const ACCENT = "#3E5C76";
export const ACCENT_DARK = "#8FB3D9";

// Brand tokens that apply in BOTH light and dark. Surface/bg tokens are
// intentionally omitted from this block — those flow from antd's algorithm so a
// hard-coded light surface can't leak through in dark mode.
const brandTokens = {
  colorInfo: ACCENT,
  colorSuccess: "#16A34A",
  colorWarning: "#F59E0B",
  colorError: "#DC2626",
  borderRadius: 8,
  fontSize: 14,
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const;

export function buildAntTheme(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      ...brandTokens,
      colorPrimary: isDark ? ACCENT_DARK : ACCENT,
      colorLink: isDark ? ACCENT_DARK : ACCENT,
      ...(isDark
        ? {
            colorBgLayout: "#000000",
            colorBgContainer: "#141414",
            colorBorder: "#303030",
            colorBorderSecondary: "#1f1f1f",
          }
        : {
            colorBgLayout: "#F8F9FB",
            colorBgContainer: "#FFFFFF",
          }),
    },
    components: {
      Button: { controlHeight: 34 },
      Input: { controlHeight: 34 },
      Select: { controlHeight: 34 },
      Segmented: { controlHeight: 34 },
    },
  };
}
