"use client";

import { useEffect } from "react";

export function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => {
      if (root.dataset.dmglyInput !== "pointer")
        root.dataset.dmglyInput = "pointer";
    };
    const keyboard = () => {
      if (root.dataset.dmglyInput !== "keyboard")
        root.dataset.dmglyInput = "keyboard";
    };
    window.addEventListener("pointerdown", pointer, {
      capture: true,
      passive: true,
    });
    window.addEventListener("pointermove", pointer, {
      capture: true,
      passive: true,
    });
    window.addEventListener("keydown", keyboard, true);
    return () => {
      window.removeEventListener("pointerdown", pointer, true);
      window.removeEventListener("pointermove", pointer, true);
      window.removeEventListener("keydown", keyboard, true);
      delete root.dataset.dmglyInput;
    };
  }, []);
}
