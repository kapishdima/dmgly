import { z } from "zod";
import defaultBackground from "./default-background.json";

export const ICON_SIZE = 128;
export const TITLEBAR_HEIGHT = 32;
const number = (min: number, max: number) => z.number().finite().min(min).max(max);
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const position = z.object({ x: number(0, 1600), y: number(0, 1200) });
const labelBackgroundSchema = z.object({
  visible: z.boolean(),
  color,
  opacity: number(0, 100),
  autoSize: z.boolean().default(true),
  offsetX: number(-1600, 1600).default(0),
  offsetY: number(-1200, 1200).default(0),
  width: number(16, 320),
  height: number(24, 96),
  radius: number(0, 48),
});
export function createLabelBackground(): z.infer<typeof labelBackgroundSchema> {
  return { visible: true, color: "#ffffff", opacity: 96, autoSize: true, offsetX: 0, offsetY: 0, width: 56, height: 24, radius: 4 };
}
const nativePosition = position.extend({
  labelBackground: labelBackgroundSchema.default(createLabelBackground),
});
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
  app: nativePosition.extend({
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
  applications: nativePosition,
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
    rotation: number(-180, 180).default(0),
  }),
  arrow: position.extend({
    visible: z.boolean(),
    shape: z.enum(["straight", "curved", "chevron"]),
    color,
    width: number(32, 240),
    thickness: number(2, 14),
    rotation: number(-180, 180),
    scale: number(0.25, 4).default(1),
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
    window: { width: 642, height: 406 },
    app: { name: "My App", x: 95, y: 90, image: null, labelBackground: createLabelBackground() },
    applications: { x: 367, y: 213, labelBackground: createLabelBackground() },
    background: {
      mode: "image",
      solid: "#f4f1eb",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { id: "a", color: "#ffefd5", at: 0 },
          { id: "b", color: "#e9a26c", at: 100 },
        ],
      },
      image: { ...defaultBackground },
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
      color: "#ffffff",
      align: "center",
      rotation: 0,
      x: 153,
      y: 273,
    },
    arrow: {
      visible: true,
      shape: "curved",
      color: "#ffffff",
      width: 165,
      thickness: 4,
      rotation: 34,
      scale: 1,
      x: 242,
      y: 105,
    },
  };
}
export function parseComposition(value: unknown): Composition {
  return compositionSchema.parse(value);
}
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export type NativeId = "app" | "applications";
export const LABEL_FONT = '13px -apple-system, BlinkMacSystemFont, sans-serif';
export const LABEL_LINE_HEIGHT = 16;
export const LABEL_PADDING = 4;
export function labelBackgroundBounds(d: Composition, id: NativeId, textWidth?: number) {
  const item = d[id], plate = item.labelBackground;
  const name = id === "app" ? d.app.name : "Applications";
  const width = plate.autoSize ? Math.min(164, textWidth ?? name.length * 6.5) + LABEL_PADDING * 2 : plate.width;
  const height = plate.autoSize ? LABEL_LINE_HEIGHT + LABEL_PADDING * 2 : plate.height;
  return {
    x: item.x + plate.offsetX - width / 2,
    y: item.y + ICON_SIZE / 2 + 6 + LABEL_LINE_HEIGHT / 2 + plate.offsetY - height / 2,
    width,
    height,
  };
}
export function moveLabelBackground(d: Composition, id: NativeId, offsetX: number, offsetY: number, textWidth?: number): Composition {
  const bounds = labelBackgroundBounds(d, id, textWidth);
  const plate = d[id].labelBackground;
  const baseX = bounds.x - plate.offsetX, baseY = bounds.y - plate.offsetY;
  return { ...d, [id]: { ...d[id], labelBackground: {
    ...plate,
    offsetX: clamp(Math.round(offsetX), Math.ceil(-baseX), Math.floor(d.window.width - bounds.width - baseX)),
    offsetY: clamp(Math.round(offsetY), Math.ceil(-baseY), Math.floor(d.window.height - TITLEBAR_HEIGHT - bounds.height - baseY)),
  } } };
}
export function movementLimits(d: Composition, id: MovableId) {
  const native = id === "app" || id === "applications";
  const top = native ? ICON_SIZE / 2 + 8 : 16;
  return {
    minX: top,
    maxX: d.window.width - top,
    minY: top,
    maxY: d.window.height - TITLEBAR_HEIGHT - top - (native ? 24 : 0),
  };
}
export function moveElement(d: Composition, id: MovableId, x: number, y: number): Composition {
  const limits = movementLimits(d, id);
  return {
    ...d,
    [id]: {
      ...d[id],
      x: Math.round(clamp(x, limits.minX, limits.maxX)),
      y: Math.round(clamp(y, limits.minY, limits.maxY)),
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
  for (const id of ["app", "applications"] as const)
    next = moveLabelBackground(next, id, next[id].labelBackground.offsetX, next[id].labelBackground.offsetY);
  return next;
}
export function snapshot(d: Composition): Composition {
  return parseComposition(structuredClone(d));
}
