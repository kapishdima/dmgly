"use client";
import { useEffect, useRef, useState } from "react";
import { Composition, compositionSchema } from "@/lib/dmgly/model";
import { loadDraft, saveDraft } from "@/lib/dmgly/persistence";
export function useDraft(document: Composition, restore: (d: Composition) => void) {
  const [ready, setReady] = useState(false),
    [status, setStatus] = useState("Opening draft…");
  const latest = useRef(document),
    saved = useRef(document);
  useEffect(() => {
    latest.current = document;
  }, [document]);
  useEffect(() => {
    let active = true;
    loadDraft()
      .then((value) => {
        if (!active) return;
        if (value) {
          saved.current = value;
          restore(value);
        }
        setStatus("Saved on this device");
      })
      .catch((e) => {
        if (active)
          setStatus(
            e instanceof Error ? e.message : "Local saving is unavailable. You can still export.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [restore]);
  useEffect(() => {
    if (!ready || saved.current === document) return;
    let active = true;
    const timer = setTimeout(() => {
      if (!compositionSchema.safeParse(document).success) {
        setStatus("Complete the app name to save your draft.");
        return;
      }
      saveDraft(document)
        .then(() => {
          saved.current = document;
          if (active) setStatus("Saved on this device");
        })
        .catch(() => {
          if (active)
            setStatus("Could not save locally. Free up browser storage, or export your design.");
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [document, ready]);
  useEffect(() => {
    const flush = () => {
      if (
        ready &&
        saved.current !== latest.current &&
        compositionSchema.safeParse(latest.current).success
      )
        void saveDraft(latest.current).catch(() => {});
    };
    documentGlobal().addEventListener("visibilitychange", flush);
    return () => documentGlobal().removeEventListener("visibilitychange", flush);
  }, [ready]);
  return { ready, status };
}
function documentGlobal() {
  return window.document;
}
