
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Apply saved theme before first paint to prevent flash
  (() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved === 'dark' || (saved !== 'light' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch { /* ignore */ }
  })();

  createRoot(document.getElementById("root")!).render(<App />);
  