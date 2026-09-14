import { expect, test } from "bun:test";
import { artworkSvg } from "../lib/dmgly/artwork";
import { createComposition, parseComposition } from "../lib/dmgly/model";
import { createHistory, reduceHistory } from "../lib/dmgly/history";
import {
  canTransform,
  moveSelection,
  rotatePoint,
  rotateSelection,
  scaleSelection,
  selectElement,
  selectionFrame,
  visibleElements,
} from "../lib/dmgly/transforms";

test("Shift selection toggles objects and select all excludes background and hidden decorations", () => {
  expect(selectElement(["background"], "app", true)).toEqual(["app"]);
  expect(selectElement(["app"], "arrow", true)).toEqual(["app", "arrow"]);
  expect(selectElement(["app", "arrow"], "app", true)).toEqual(["arrow"]);
  expect(selectElement(["app", "arrow"], "text")).toEqual(["text"]);
  const d = createComposition();
  d.text.visible = false;
  expect(visibleElements(d)).toEqual(["app", "applications", "arrow"]);
});

test("group movement stops at the boundary without changing relative positions", () => {
  const d = createComposition();
  const ids = visibleElements(d);
  const next = moveSelection(d, ids, -1000, -1000);
  expect(next.app.x).toBe(72);
  expect(next.app.y).toBe(72);
  for (const id of ids) {
    expect(next[id].x - next.app.x).toBe(d[id].x - d.app.x);
    expect(next[id].y - next.app.y).toBe(d[id].y - d.app.y);
  }
  expect(d.app).toMatchObject({ x: 95, y: 90 });
});

test("group rotation preserves distances and is baked into exported artwork", () => {
  const d = createComposition();
  const ids = ["text", "arrow"] as const;
  const frame = selectionFrame(d, [...ids])!;
  const next = rotateSelection(d, [...ids], frame, 30);
  expect(next.text.rotation).toBe(30);
  expect(next.arrow.rotation).toBe(64);
  expect(
    Math.hypot(next.text.x - next.arrow.x, next.text.y - next.arrow.y),
  ).toBeCloseTo(Math.hypot(d.text.x - d.arrow.x, d.text.y - d.arrow.y));
  expect(artworkSvg(next)).toContain(
    `rotate(30 ${next.text.x} ${next.text.y})`,
  );
  expect(artworkSvg(next)).toContain("rotate(64) scale(1)");
  expect(parseComposition(next)).toEqual(next);
});

test("scaling a rotated arrow keeps the opposite corner anchored and scales its entire shape", () => {
  const d = createComposition();
  const frame = selectionFrame(d, ["arrow"])!;
  const anchor = rotatePoint(
    { x: frame.x - frame.width / 2, y: frame.y - frame.height / 2 },
    frame,
    frame.rotation,
  );
  const next = scaleSelection(d, ["arrow"], anchor, 1.5);
  const after = selectionFrame(next, ["arrow"])!;
  const fixed = rotatePoint(
    { x: after.x - after.width / 2, y: after.y - after.height / 2 },
    after,
    after.rotation,
  );
  expect(fixed.x).toBeCloseTo(anchor.x);
  expect(fixed.y).toBeCloseTo(anchor.y);
  expect(next.arrow.scale).toBe(1.5);
  expect(artworkSvg(next)).toContain("rotate(34) scale(1.5)");
});

test("text and arrow group scaling uses one bounded ratio and leaves native Finder icons intact", () => {
  const d = createComposition();
  const next = scaleSelection(d, ["text", "arrow"], { x: 0, y: 0 }, 1.2);
  expect(next.text.size).toBeCloseTo(d.text.size * 1.2);
  expect(next.arrow.scale).toBeCloseTo(1.2);
  expect(next.arrow.x - next.text.x).toBeCloseTo((d.arrow.x - d.text.x) * 1.2);
  expect(canTransform(["text", "app"])).toBe(false);
  expect(scaleSelection(d, ["app"], d.app, 2)).toBe(d);
  expect(rotateSelection(d, ["applications"], d.applications, 90)).toBe(d);
  expect(scaleSelection(d, ["text"], d.text, 100).text.size).toBe(64);
  expect(scaleSelection(d, ["text"], d.text, -2).text.size).toBe(12);
});

test("legacy drafts gain transform defaults without altering their composition", () => {
  const d = createComposition();
  const text = Object.fromEntries(
    Object.entries(d.text).filter(([key]) => key !== "rotation"),
  );
  const arrow = Object.fromEntries(
    Object.entries(d.arrow).filter(([key]) => key !== "scale"),
  );
  expect(parseComposition({ ...d, text, arrow })).toEqual(d);
});

test("one transformation gesture is one undo step", () => {
  const d = createComposition();
  let h = reduceHistory(createHistory(d), { type: "begin" });
  for (const angle of [10, 20, 30])
    h = reduceHistory(h, {
      type: "edit",
      value: rotateSelection(d, ["arrow"], d.arrow, angle),
    });
  h = reduceHistory(h, { type: "end" });
  expect(h.past).toHaveLength(1);
  const after = h.present;
  h = reduceHistory(h, { type: "undo" });
  expect(h.present).toEqual(d);
  h = reduceHistory(h, { type: "redo" });
  expect(h.present).toEqual(after);
});
