import { useState, useEffect, useCallback } from "react";

const RAMADAN_KEY = "study-dashboard-ramadan-mode";

interface UseRamadanModeReturn {
  isRamadan: boolean;
  toggle: () => void;
}

export const useRamadanMode = (): UseRamadanModeReturn => {
  const [isRamadan, setIsRamadan] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RAMADAN_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isRamadan) {
      document.documentElement.classList.add("ramadan");
    } else {
      document.documentElement.classList.remove("ramadan");
    }
    try {
      localStorage.setItem(RAMADAN_KEY, String(isRamadan));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [isRamadan]);

  const toggle = useCallback(() => setIsRamadan((v) => !v), []);

  return { isRamadan, toggle };
};