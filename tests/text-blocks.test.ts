import { expect, test } from "bun:test";
import { addText, createComposition, getText, parseComposition, removeText, resizeWindow, updateText } from "../lib/dmgly/model";
import { artworkSvg } from "../lib/dmgly/artwork";
import { compositionSettings, DEFAULT_BACKGROUND_ID, parseSettings, serializeSettings } from "../lib/dmgly/url-state";
import { moveSelection, rotateSelection, scaleSelection, selectionFrame, visibleElements } from "../lib/dmgly/transforms";
import { createHistory, reduceHistory } from "../lib/dmgly/history";

test("legacy documents and links preserve the original text as the first block", () => {
  const d = createComposition();
  const { texts, ...rest } = d;
  const { id, ...text } = texts[0];
  text.content = "Київ & Friends";
  text.rotation = 28;
  const migrated = parseComposition({ ...rest, text });
  expect(migrated.texts).toEqual([{ ...text, id }]);
  expect(parseSettings(JSON.stringify({ version: 1, text: { content: text.content, rotation: 28 } }))?.texts).toEqual(migrated.texts);
});

test("adding many independent blocks survives a link larger than the former 10 KB limit", () => {
  let d = createComposition();
  for (let i = 0; i < 150; i++) d = addText(d).document;
  expect(d.texts).toHaveLength(151);
  expect(new Set(d.texts.map((text) => text.id)).size).toBe(151);
  const settings = compositionSettings(d, null, DEFAULT_BACKGROUND_ID);
  const link = serializeSettings(settings);
  expect(link.length).toBeGreaterThan(10000);
  expect(parseSettings(link)).toEqual(settings);
  expect(parseComposition(d)).toEqual(d);
  expect(() => parseComposition({ ...d, texts: [d.texts[0], d.texts[0]] })).toThrow();
});

test("editing and hiding one block leaves others intact and exports every visible block in order", () => {
  const original = createComposition();
  const first = addText(original);
  const second = addText(first.document);
  let d = updateText(second.document, first.id, { content: '<Hello & "world">', color: "#123456", rotation: 27 });
  d = updateText(d, second.id, { content: "Hidden secret", visible: false });
  expect(d.texts[0]).toEqual(original.texts[0]);
  const svg = artworkSvg(d);
  expect(svg.match(/<text /g)).toHaveLength(2);
  expect(svg).toContain('&lt;Hello &amp; &quot;world&quot;&gt;');
  expect(svg).toContain('fill="#123456"');
  expect(svg).toContain(`rotate(27 ${getText(d, first.id)!.x} ${getText(d, first.id)!.y})`);
  expect(svg.indexOf('data-text-id="text"')).toBeLessThan(svg.indexOf(`data-text-id="${first.id}"`));
  expect(svg).not.toContain("Hidden secret");
  expect(visibleElements(d)).toContain(first.id);
  expect(visibleElements(d)).not.toContain(second.id);
});

test("new blocks support group movement, rotation, scaling and resize constraints", () => {
  const added = addText(createComposition());
  const d = updateText(added.document, added.id, { x: 200, y: 210, size: 24 });
  const ids = ["text" as const, added.id];
  const moved = moveSelection(d, ids, 20, -10);
  for (const id of ids) {
    expect(getText(moved, id)!.x).toBe(getText(d, id)!.x + 20);
    expect(getText(moved, id)!.y).toBe(getText(d, id)!.y - 10);
  }
  const frame = selectionFrame(d, ids)!;
  const rotated = rotateSelection(d, ids, frame, 15);
  expect(getText(rotated, added.id)!.rotation).toBe(15);
  const scaled = scaleSelection(d, ids, { x: 0, y: 0 }, 1.1);
  expect(getText(scaled, added.id)!.size).toBeCloseTo(26.4);
  expect(scaled.app).toEqual(d.app);
  const outside = updateText(d, added.id, { x: 900, y: 700 });
  const small = resizeWindow(outside, 480, 320);
  expect(getText(small, added.id)!.x).toBe(464);
  expect(getText(small, added.id)!.y).toBe(272);
});

test("deleting the last block stays empty through export and reload and can be undone", () => {
  const d = createComposition();
  const empty = removeText(d, "text");
  expect(empty.texts).toEqual([]);
  expect(artworkSvg(empty)).not.toContain("<text ");
  const settings = compositionSettings(empty, null, DEFAULT_BACKGROUND_ID);
  expect(parseSettings(serializeSettings(settings))?.texts).toEqual([]);
  let history = reduceHistory(createHistory(d), { type: "edit", value: empty });
  history = reduceHistory(history, { type: "undo" });
  expect(history.present.texts).toEqual(d.texts);
  history = reduceHistory(history, { type: "redo" });
  expect(history.present.texts).toEqual([]);
  expect(addText(history.present).document.texts).toHaveLength(1);
});
