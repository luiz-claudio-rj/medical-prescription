import React from "react";
import PrescriptionForm from "./PrescriptionForm";
import { ThemeProvider, useTheme } from "./context/theme";
import { Button } from "./components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

const AppContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="App relative">
      <header className="sticky top-0  bg-slate-200 dark:bg-slate-800 z-10">
        <div className="container flex gap-4 pt-4 justify-between  sm:px-24 items-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 ">
            Gerador de prescrição médica
          </h1>
          <Button onClick={toggleTheme} className="mb-4 bg-transparent hover:bg-transparent">
            {theme === "light" ? (
              <MoonIcon className="h-8 w-8 text-foreground"  />
            ) : (
              <SunIcon className="h-8 w-8  text-foreground"  />
            )}
          </Button>
        </div>
      </header>
      <div className="container relative">
        <PrescriptionForm />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
