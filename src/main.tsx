// Icebreaker
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles.css";

// Restore a deep route that public/404.html parked in ?redirect=.
// GitHub Pages can't serve /icebreaker/browse directly, so a direct hit lands
// on 404.html, which bounces here with the original path. Rewrite the URL
// before React mounts so the router sees the route the user actually asked for.
(function restoreDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (!redirect) return;
  const base = import.meta.env.BASE_URL;
  const clean = redirect.startsWith("/") ? redirect.slice(1) : redirect;
  window.history.replaceState(null, "", base + clean);
})();

createRoot(document.getElementById("root")!).render(<App />);
