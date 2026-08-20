import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Tools from "./pages/Tools";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { useTheme } from "@/hooks/use-theme";
import { buildAntTheme } from "@/lib/theme";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ConfigProvider theme={buildAntTheme(isDark)}>
      <AntdApp>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/tools/:id" element={<Tools />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}
