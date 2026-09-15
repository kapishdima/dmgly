import { z } from "zod";
import { createParser } from "nuqs/server";
import {
  compositionSchema,
  createComposition,
  type Composition,
} from "./model";

export const DEFAULT_BACKGROUND_ID = "builtin:dithering-v3";
const localReference = z.string().regex(/^local:[a-f0-9]{64}$/);
const settingsSchema = compositionSchema.extend({
  app: compositionSchema.shape.app.extend({ image: localReference.nullable() }),
  background: compositionSchema.shape.background.extend({
    image: z
      .union([localReference, z.literal(DEFAULT_BACKGROUND_ID)])
      .nullable(),
  }),
});
export type UrlSettings = z.infer<typeof settingsSchema>;
export type AssetReference = UrlSettings["background"]["image"];

export function compositionSettings(
  document: Composition,
  appImage: UrlSettings["app"]["image"],
  backgroundImage: AssetReference,
): UrlSettings {
  return settingsSchema.parse({
    ...document,
    app: { ...document.app, image: appImage },
    background: { ...document.background, image: backgroundImage },
  });
}

export const defaultSettings = compositionSettings(
  createComposition(),
  null,
  DEFAULT_BACKGROUND_ID,
);

export function serializeSettings(settings: UrlSettings): string {
  const delta: Record<string, unknown> = { version: 1 };
  for (const key of [
    "window",
    "app",
    "applications",
    "background",
    "arrow",
  ] as const) {
    const changes = Object.fromEntries(
      Object.entries(settings[key]).filter(
        ([field, value]) =>
          JSON.stringify(value) !==
          JSON.stringify(
            (defaultSettings[key] as Record<string, unknown>)[field],
          ),
      ),
    );
    if (Object.keys(changes).length) delta[key] = changes;
  }
  if (JSON.stringify(settings.texts) !== JSON.stringify(defaultSettings.texts)) delta.texts = settings.texts;
  return JSON.stringify(delta);
}

export function parseSettings(raw: string): UrlSettings | null {
  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || value.version !== 1) return null;
    const merged: Record<string, unknown> = { version: 1 };
    for (const key of [
      "window",
      "app",
      "applications",
      "background",
      "arrow",
    ] as const) {
      if (
        value[key] !== undefined &&
        (!value[key] ||
          typeof value[key] !== "object" ||
          Array.isArray(value[key]))
      )
        return null;
      merged[key] = { ...defaultSettings[key], ...value[key] };
    }
    if ("text" in value && (!value.text || typeof value.text !== "object" || Array.isArray(value.text))) return null;
    merged.texts = "texts" in value ? value.texts
      : "text" in value ? [{ ...defaultSettings.texts[0], ...value.text, id: "text" }]
      : defaultSettings.texts;
    const parsed = settingsSchema.safeParse(merged);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const settingsParser = createParser({
  parse: parseSettings,
  serialize: serializeSettings,
  eq: (a: UrlSettings, b: UrlSettings) =>
    serializeSettings(a) === serializeSettings(b),
})
  .withDefault(defaultSettings)
  .withOptions({
    history: "replace",
    shallow: true,
    scroll: false,
    clearOnDefault: true,
  });
