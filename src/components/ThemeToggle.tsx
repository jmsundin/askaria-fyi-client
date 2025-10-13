import { TbMoonStars, TbSunHigh } from "react-icons/tb";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-live="polite"
    >
      {isDark ? (
        <TbSunHigh aria-hidden="true" />
      ) : (
        <TbMoonStars aria-hidden="true" />
      )}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
