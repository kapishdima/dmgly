import { expect, test } from "bun:test";
import { createComposition, moveElement } from "../lib/dmgly/model";
import { createHistory, reduceHistory } from "../lib/dmgly/history";
test("a whole drag is one undo step and redo restores it", () => {
  const d = createComposition();
  let h = createHistory(d);
  h = reduceHistory(h, { type: "begin" });
  for (let x = 181; x <= 220; x++)
    h = reduceHistory(h, { type: "edit", value: moveElement(h.present, "app", x, 170) });
  h = reduceHistory(h, { type: "end" });
  expect(h.past.length).toBe(1);
  h = reduceHistory(h, { type: "undo" });
  expect(h.present.app.x).toBe(d.app.x);
  h = reduceHistory(h, { type: "redo" });
  expect(h.present.app.x).toBe(220);
});
test("new edits clear redo; restoring draft resets history", () => {
  let h = createHistory(createComposition());
  h = reduceHistory(h, { type: "edit", value: moveElement(h.present, "app", 200, 170) });
  h = reduceHistory(h, { type: "undo" });
  h = reduceHistory(h, {
    type: "edit",
    value: { ...h.present, texts: [{ ...h.present.texts[0], visible: false }] },
  });
  expect(h.future).toEqual([]);
  h = reduceHistory(h, { type: "restore", value: createComposition() });
  expect(h.past).toEqual([]);
});
