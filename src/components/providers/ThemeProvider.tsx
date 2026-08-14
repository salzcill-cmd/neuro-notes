"use client";

import * as React from "react";
import { useAppStore } from "@/stores";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.settings.theme);
  const accentColor = useAppStore((s) => s.settings.accentColor);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "oled");

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply the user's accent color to the design tokens. Values are stored
  // as HSL triplets (e.g. "217 91% 60%"), so they slot straight into CSS.
  React.useEffect(() => {
    const root = document.documentElement;
    if (accentColor) {
      root.style.setProperty("--primary", `hsl(${accentColor})`);
      root.style.setProperty("--ring", `hsl(${accentColor})`);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    }
  }, [accentColor]);

  return <>{children}</>;
}
