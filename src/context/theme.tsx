import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");

  const updateTheme = (theme: Theme) => {

    localStorage.setItem("theme", theme);
    setTheme(theme);
    document.documentElement.className = theme === "dark" ? "dark" : "light";
  };

  const toggleTheme = () => {
    updateTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const localTheme = localStorage.getItem("theme") as Theme;
    if (localTheme) {
      updateTheme(localTheme);
      return;
    }

    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    updateTheme(prefersDarkMode ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
