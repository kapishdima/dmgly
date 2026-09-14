import { Composition, createComposition, parseComposition } from "./model";

/** Upgrade only untouched starter compositions, preserving customized drafts. */
export async function upgradeStarterDraft(draft: Composition): Promise<Composition> {
  const current = createComposition();
  const previous: Composition = {
    ...current,
    background: { ...current.background, mode: "gradient", image: null },
    text: { ...current.text, color: "#684631" },
    arrow: { ...current.arrow, color: "#946241" },
  };
  const serialized = JSON.stringify(parseComposition(draft));
  if (serialized === JSON.stringify(parseComposition(previous))) return current;

  const image = draft.background.image;
  if (
    image?.name === "Dithering@2x.png" &&
    image.width === 1600 && image.height === 1200 &&
    serialized === JSON.stringify(parseComposition({
      ...current,
      background: { ...current.background, image },
    })) &&
    globalThis.crypto?.subtle
  ) {
    const bytes = Uint8Array.from(atob(image.data.split(",")[1]), (char) => char.charCodeAt(0));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if (hash === "445edda6c0135328bf0611cb4a598e1297f2c87c7b9efb50aca9d36efb9b3cfb") return current;
  }
  return draft;
}
