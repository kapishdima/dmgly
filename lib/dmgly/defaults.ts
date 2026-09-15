import { Composition, createComposition, parseComposition } from "./model";

/** Upgrade only untouched starter compositions, preserving customized drafts. */
export async function upgradeStarterDraft(draft: Composition): Promise<Composition> {
  const current = createComposition();
  const previousImage: Composition = {
    ...current,
    window: { width: 660, height: 400 },
    app: { ...current.app, x: 180, y: 170 },
    applications: { ...current.applications, x: 480, y: 170 },
    texts: [{ ...current.texts[0], x: 330, y: 302 }],
    arrow: { ...current.arrow, shape: "straight", width: 86, rotation: 0, x: 330, y: 170 },
  };
  const previous: Composition = {
    ...previousImage,
    background: { ...current.background, mode: "gradient", image: null },
    texts: [{ ...previousImage.texts[0], color: "#684631" }],
    arrow: { ...previousImage.arrow, color: "#946241" },
  };
  const serialized = JSON.stringify(parseComposition(draft));
  if (serialized === JSON.stringify(parseComposition(previous))) return current;
  if (serialized === JSON.stringify(parseComposition(previousImage))) return current;

  const image = draft.background.image;
  if (
    image && ["Dithering@2x.png", "Dithering@2x (1).png", "Dithering@2x (2).png", "Dithering@2x (3).png"].includes(image.name) &&
    image.width === 1600 && image.height === 1200 &&
    serialized === JSON.stringify(parseComposition({
      ...(image.name === "Dithering@2x (3).png" ? current : previousImage),
      background: { ...current.background, image },
    })) &&
    globalThis.crypto?.subtle
  ) {
    const bytes = Uint8Array.from(atob(image.data.split(",")[1]), (char) => char.charCodeAt(0));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if ([
      "445edda6c0135328bf0611cb4a598e1297f2c87c7b9efb50aca9d36efb9b3cfb",
      "d5638fc5dcc097164df5cfd49e4721e670d69a02540f68e09bff47f3f3fe118b",
      "b6d44aee313564e203b11ed9a936486eec40b171a72b167e2b19be3016210a13",
      "b10d1b6c775bc14fa7d2a3989b3e54011d8d3111ff3e0d2bbd374e03fcb404d0",
    ].includes(hash)) return current;
  }
  return draft;
}
