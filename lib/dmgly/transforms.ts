import { textBounds } from "./artwork";
import {
  clamp,
  Composition,
  ElementId,
  ICON_SIZE,
  MovableId,
  movementLimits,
  TITLEBAR_HEIGHT,
} from "./model";

export type Point = { x: number; y: number };
export type SelectionFrame = Point & {
  width: number;
  height: number;
  rotation: number;
};

export function visibleElements(d: Composition): MovableId[] {
  return (["app", "applications", "text", "arrow"] as const).filter(
    (id) => !("visible" in d[id]) || d[id].visible,
  );
}

export function selectElement(
  selection: ElementId[],
  id: ElementId,
  additive = false,
): ElementId[] {
  if (id === "background") return ["background"];
  if (!additive) return [id];
  const items = selection.filter((item) => item !== "background");
  return items.includes(id)
    ? items.filter((item) => item !== id)
    : [...items, id];
}

export function rotatePoint(
  point: Point,
  center: Point,
  degrees: number,
): Point {
  const angle = (degrees * Math.PI) / 180,
    cos = Math.cos(angle),
    sin = Math.sin(angle);
  const x = point.x - center.x,
    y = point.y - center.y;
  return { x: center.x + x * cos - y * sin, y: center.y + x * sin + y * cos };
}

export function elementFrame(
  d: Composition,
  id: MovableId,
  textFrame?: SelectionFrame | null,
): SelectionFrame {
  if (id === "text" && textFrame) return textFrame;
  const bounds =
    id === "text"
      ? textBounds(d)
      : id === "arrow"
        ? {
            width: (d.arrow.width + 20) * d.arrow.scale,
            height: 60 * d.arrow.scale,
          }
        : { width: ICON_SIZE, height: ICON_SIZE };
  return {
    ...bounds,
    x: d[id].x,
    y: d[id].y,
    rotation: id === "text" || id === "arrow" ? d[id].rotation : 0,
  };
}

export function selectionFrame(
  d: Composition,
  ids: MovableId[],
  textFrame?: SelectionFrame | null,
): SelectionFrame | null {
  if (!ids.length) return null;
  if (ids.length === 1) return elementFrame(d, ids[0], textFrame);
  const points = ids.flatMap((id) => {
    const frame = elementFrame(d, id, textFrame);
    return [-1, 1].flatMap((x) =>
      [-1, 1].map((y) =>
        rotatePoint(
          {
            x: frame.x + (x * frame.width) / 2,
            y: frame.y + (y * frame.height) / 2,
          },
          frame,
          frame.rotation,
        ),
      ),
    );
  });
  const left = Math.min(...points.map((p) => p.x)),
    right = Math.max(...points.map((p) => p.x));
  const top = Math.min(...points.map((p) => p.y)),
    bottom = Math.max(...points.map((p) => p.y));
  return {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
    width: right - left,
    height: bottom - top,
    rotation: 0,
  };
}

export function moveSelection(
  d: Composition,
  ids: MovableId[],
  dx: number,
  dy: number,
): Composition {
  if (!ids.length) return d;
  let minX = -Infinity,
    maxX = Infinity,
    minY = -Infinity,
    maxY = Infinity;
  for (const id of ids) {
    const limits = movementLimits(d, id);
    minX = Math.max(minX, limits.minX - d[id].x);
    maxX = Math.min(maxX, limits.maxX - d[id].x);
    minY = Math.max(minY, limits.minY - d[id].y);
    maxY = Math.min(maxY, limits.maxY - d[id].y);
  }
  const x = Math.round(clamp(dx, Math.min(0, minX), Math.max(0, maxX)));
  const y = Math.round(clamp(dy, Math.min(0, minY), Math.max(0, maxY)));
  if (x === 0 && y === 0) return d;
  const next = { ...d };
  for (const id of ids)
    Object.assign(next, { [id]: { ...d[id], x: d[id].x + x, y: d[id].y + y } });
  return next;
}

export function canTransform(ids: MovableId[]) {
  return ids.length > 0 && ids.every((id) => id === "text" || id === "arrow");
}
const normalizedAngle = (degrees: number) =>
  ((((degrees + 180) % 360) + 360) % 360) - 180;
const centersFit = (d: Composition, ids: MovableId[]) =>
  ids.every(
    (id) =>
      d[id].x >= 0 &&
      d[id].x <= d.window.width &&
      d[id].y >= 0 &&
      d[id].y <= d.window.height - TITLEBAR_HEIGHT,
  );

export function rotateSelection(
  d: Composition,
  ids: MovableId[],
  center: Point,
  degrees: number,
): Composition {
  if (!canTransform(ids) || !Number.isFinite(degrees) || degrees === 0)
    return d;
  const next = { ...d };
  for (const id of ids) {
    if (id !== "text" && id !== "arrow") continue;
    Object.assign(next, {
      [id]: {
        ...d[id],
        ...rotatePoint(d[id], center, degrees),
        rotation: normalizedAngle(d[id].rotation + degrees),
      },
    });
  }
  return centersFit(next, ids) ? next : d;
}

export function scaleSelection(
  d: Composition,
  ids: MovableId[],
  anchor: Point,
  factor: number,
): Composition {
  if (!canTransform(ids) || !Number.isFinite(factor)) return d;
  let min = 0,
    max = Infinity;
  for (const id of ids) {
    if (id === "text") {
      min = Math.max(min, 12 / d.text.size);
      max = Math.min(max, 64 / d.text.size);
    }
    if (id === "arrow") {
      min = Math.max(min, 0.25 / d.arrow.scale);
      max = Math.min(max, 4 / d.arrow.scale);
    }
    for (const axis of ["x", "y"] as const) {
      const offset = d[id][axis] - anchor[axis];
      if (offset === 0) continue;
      const limit =
        axis === "x" ? d.window.width : d.window.height - TITLEBAR_HEIGHT;
      const a = -anchor[axis] / offset,
        b = (limit - anchor[axis]) / offset;
      min = Math.max(min, Math.min(a, b));
      max = Math.min(max, Math.max(a, b));
    }
  }
  if (min > max) return d;
  const ratio = clamp(factor, min, max);
  if (ratio === 1) return d;
  const next = { ...d };
  for (const id of ids) {
    if (id !== "text" && id !== "arrow") continue;
    const position = {
      x: anchor.x + (d[id].x - anchor.x) * ratio,
      y: anchor.y + (d[id].y - anchor.y) * ratio,
    };
    Object.assign(next, {
      [id]: {
        ...d[id],
        ...position,
        ...(id === "text"
          ? { size: d.text.size * ratio }
          : { scale: d.arrow.scale * ratio }),
      },
    });
  }
  return centersFit(next, ids) ? next : d;
}
