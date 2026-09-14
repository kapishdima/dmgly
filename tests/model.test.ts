import { expect, test } from "bun:test";
import {
  createComposition,
  moveElement,
  parseComposition,
  resizeWindow,
  snapshot,
} from "../lib/dmgly/model";
test("defaults and Unicode user data round-trip", () => {
  const d = createComposition();
  d.app.name = "Київ & Friends";
  d.text.content = "こんにちは";
  expect(parseComposition(JSON.parse(JSON.stringify(d)))).toEqual(d);
});
test("invalid persisted state is rejected", () => {
  const d = createComposition();
  expect(() => parseComposition({ ...d, version: 2 })).toThrow();
  expect(() => parseComposition({ ...d, window: { width: NaN, height: 400 } })).toThrow();
});
test("positions clamp without mutating input", () => {
  const d = createComposition();
  const next = moveElement(d, "app", -300, 9999);
  expect(next.app.x).toBe(72);
  expect(next.app.y).toBe(278);
  expect(d.app.x).toBe(95);
});
test("resizing constrains native icons and snapshot stays isolated", () => {
  const d = createComposition();
  d.applications.x = 600;
  const small = resizeWindow(d, 480, 320);
  expect(small.applications.x).toBe(408);
  const copy = snapshot(d);
  copy.text.visible = false;
  expect(d.text.visible).toBe(true);
});
