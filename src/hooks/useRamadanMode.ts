import { useState, useEffect, useCallback } from "react";

const RAMADAN_KEY = "study-dashboard-ramadan-mode";

export const useRamadanMode = () => {
  const [isRamadan, setIsRamadan] = useState(() => {
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
    localStorage.setItem(RAMADAN_KEY, String(isRamadan));
  }, [isRamadan]);

  const toggle = useCallback(() => setIsRamadan((v) => !v), []);

  return { isRamadan, toggle };
};
