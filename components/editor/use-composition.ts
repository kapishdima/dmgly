"use client";
import { useCallback, useEffect, useReducer } from "react";
import { Composition, createComposition } from "@/lib/dmgly/model";
import { createHistory, reduceHistory } from "@/lib/dmgly/history";
export function useComposition() {
  const [history, dispatch] = useReducer(reduceHistory, undefined, () =>
    createHistory(createComposition()),
  );
  const edit = useCallback((value: Composition) => dispatch({ type: "edit", value }), []);
  const restore = useCallback((value: Composition) => dispatch({ type: "restore", value }), []);
  const begin = useCallback(() => dispatch({ type: "begin" }), []),
    end = useCallback(() => dispatch({ type: "end" }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []),
    redo = useCallback(() => dispatch({ type: "redo" }), []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;
      const target = e.target as HTMLElement;
      if (target.closest('input,textarea,[contenteditable="true"]')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return {
    document: history.present,
    edit,
    restore,
    begin,
    end,
    undo,
    redo,
    canUndo:
      history.past.length > 0 || (!!history.transaction && history.transaction !== history.present),
    canRedo: history.future.length > 0,
  };
}
