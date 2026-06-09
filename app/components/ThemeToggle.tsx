"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

function getResolved(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ainsyirah-theme") as Theme | null;
    const initial = saved || "system";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function applyTheme(t: Theme) {
    const resolved = getResolved(t);
    document.documentElement.setAttribute("data-theme", resolved);
  }

  function cycle() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("ainsyirah-theme", next);
    applyTheme(next);
  }

  if (!mounted) return null;

  const icons: Record<Theme, string> = {
    light: "☀️",
    dark: "🌙",
    system: "💻",
  };

  const labels: Record<Theme, string> = {
    light: "Terang",
    dark: "Gelap",
    system: "Otomatis",
  };

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-medium transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--ink-secondary)",
      }}
      title={`Tema: ${labels[theme]}`}
    >
      <span>{icons[theme]}</span>
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
}
