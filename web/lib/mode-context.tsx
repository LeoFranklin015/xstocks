"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type AppMode = "expert" | "grandma";

type ModeContextValue = {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  toggleMode: () => void;
  isGrandma: boolean;
  isExpert: boolean;
  t: (expert: string, grandma: string) => string;
};

const ModeContext = createContext<ModeContextValue | null>(null);

const STORAGE_KEY = "xstream_app_mode";

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("expert");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "grandma" || stored === "expert") {
        setModeState(stored);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function setMode(m: AppMode) {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // ignore
    }
  }

  function toggleMode() {
    setMode(mode === "expert" ? "grandma" : "expert");
  }

  const value: ModeContextValue = {
    mode,
    setMode,
    toggleMode,
    isGrandma: mode === "grandma",
    isExpert: mode === "expert",
    t: (expert, grandma) => (mode === "expert" ? expert : grandma),
  };

  if (!hydrated) return null;

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useAppMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useAppMode must be used within ModeProvider");
  return ctx;
}
