import { useCallback, useEffect, useState } from "react";

// DaisyUI themes (add more if needed)
const DAISYUI_DARK_THEMES = ["dark", "business", "night", "forest", "dracula", "synthwave", "black"];
const DAISYUI_LIGHT_THEMES = ["light", "cupcake", "bumblebee", "emerald", "corporate", "winter"];

function getCurrentTheme(): string {
  // DaisyUI usually sets data-theme on <html> or <body>
  const htmlTheme = document.documentElement.getAttribute("data-theme");
  const bodyTheme = document.body.getAttribute("data-theme");
  return htmlTheme || bodyTheme || "dark";
}

function mapThemeToColorMode(theme: string): "light" | "dark" {
  if (DAISYUI_LIGHT_THEMES.includes(theme)) return "light";
  // Default to dark for unknown or dark themes
  return "dark";
}

export const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => getCurrentTheme());

  // Listen for theme changes (in case set elsewhere)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Toggle between light and dark DaisyUI themes
  const toggleTheme = useCallback(() => {
    const current = getCurrentTheme();
    const isLight = DAISYUI_LIGHT_THEMES.includes(current);
    const newTheme = isLight ? "dark" : "light"; // Toggle between 'light' and 'business' (dark)
    document.documentElement.setAttribute("data-theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }, []);

  // For color logic, expose colorMode as 'light' | 'dark'
  const colorMode = mapThemeToColorMode(theme);

  return { theme, colorMode, toggleTheme };
};