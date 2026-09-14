import { Composition, createComposition, parseComposition } from "./model";

/** Upgrade only the untouched starter composition from before the image default. */
export function upgradeStarterDraft(draft: Composition): Composition {
  const current = createComposition();
  const previous: Composition = {
    ...current,
    background: { ...current.background, mode: "gradient", image: null },
    text: { ...current.text, color: "#684631" },
    arrow: { ...current.arrow, color: "#946241" },
  };
  return JSON.stringify(parseComposition(draft)) === JSON.stringify(parseComposition(previous))
    ? current
    : draft;
}
