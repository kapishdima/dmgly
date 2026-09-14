import { z } from "zod";

export const ICON_SIZE = 128;
export const TITLEBAR_HEIGHT = 28;
const number = (min: number, max: number) => z.number().finite().min(min).max(max);
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const position = z.object({ x: number(0, 1600), y: number(0, 1200) });
const asset = z.object({
  name: z.string().max(255),
  data: z
    .string()
    .max(15_000_000)
    .regex(/^data:image\/(png|jpeg|webp);base64,/),
  width: number(1, 8192),
  height: number(1, 8192),
});
export const compositionSchema = z.object({
  version: z.literal(1),
  window: z.object({ width: number(480, 1200).int(), height: number(320, 900).int() }),
  app: position.extend({
    name: z
      .string()
      .min(1)
      .max(80)
      .refine(
        (s) => !/[\x00-\x1f/\\:]/.test(s),
        "Use a name without path separators or control characters.",
      ),
    image: asset.nullable(),
  }),
  applications: position,
  background: z.object({
    mode: z.enum(["solid", "gradient", "image"]),
    solid: color,
    gradient: z.object({
      type: z.enum(["linear", "radial"]),
      angle: number(0, 360),
      stops: z
        .array(z.object({ id: z.string(), color, at: number(0, 100) }))
        .min(2)
        .max(8),
    }),
    image: asset.nullable(),
    fit: z.enum(["fill", "fit"]),
    scale: number(0.25, 4),
    x: number(-100, 100),
    y: number(-100, 100),
  }),
  text: position.extend({
    visible: z.boolean(),
    content: z.string().max(500),
    font: z.enum(["sans", "serif", "mono"]),
    size: number(12, 64),
    color,
    align: z.enum(["left", "center", "right"]),
  }),
  arrow: position.extend({
    visible: z.boolean(),
    shape: z.enum(["straight", "curved", "chevron"]),
    color,
    width: number(32, 240),
    thickness: number(2, 14),
    rotation: number(-180, 180),
  }),
});
export type Composition = z.infer<typeof compositionSchema>;
export type ImageAsset = z.infer<typeof asset>;
export type ElementId = "background" | "app" | "applications" | "text" | "arrow";
export type MovableId = Exclude<ElementId, "background">;
export const FONT_FAMILIES = {
  sans: "Arial, sans-serif",
  serif: "Georgia, serif",
  mono: "Courier New, monospace",
};
export function createComposition(): Composition {
  return {
    version: 1,
    window: { width: 660, height: 400 },
    app: { name: "My App", x: 180, y: 170, image: null },
    applications: { x: 480, y: 170 },
    background: {
      mode: "gradient",
      solid: "#f4f1eb",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { id: "a", color: "#ffefd5", at: 0 },
          { id: "b", color: "#e9a26c", at: 100 },
        ],
      },
      image: null,
      fit: "fill",
      scale: 1,
      x: 0,
      y: 0,
    },
    text: {
      visible: true,
      content: "Drag to Applications to install",
      font: "sans",
      size: 18,
      color: "#684631",
      align: "center",
      x: 330,
      y: 302,
    },
    arrow: {
      visible: true,
      shape: "straight",
      color: "#946241",
      width: 86,
      thickness: 4,
      rotation: 0,
      x: 330,
      y: 170,
    },
  };
}
export function parseComposition(value: unknown): Composition {
  return compositionSchema.parse(value);
}
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export function moveElement(d: Composition, id: MovableId, x: number, y: number): Composition {
  const margin = id === "app" || id === "applications" ? ICON_SIZE / 2 + 8 : 16;
  return {
    ...d,
    [id]: {
      ...d[id],
      x: Math.round(clamp(x, margin, d.window.width - margin)),
      y: Math.round(
        clamp(
          y,
          margin,
          d.window.height -
            TITLEBAR_HEIGHT -
            margin -
            (id === "app" || id === "applications" ? 24 : 0),
        ),
      ),
    },
  };
}
export function resizeWindow(d: Composition, width: number, height: number): Composition {
  let next = {
    ...d,
    window: {
      width: Math.round(clamp(width, 480, 1200)),
      height: Math.round(clamp(height, 320, 900)),
    },
  };
  for (const id of ["app", "applications", "text", "arrow"] as const)
    next = moveElement(next, id, next[id].x, next[id].y);
  return next;
}
export function snapshot(d: Composition): Composition {
  return parseComposition(structuredClone(d));
}
