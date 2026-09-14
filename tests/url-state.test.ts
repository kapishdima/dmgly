import { expect, test } from "bun:test";
import { createComposition } from "../lib/dmgly/model";
import {
  compositionSettings,
  defaultSettings,
  DEFAULT_BACKGROUND_ID,
  parseSettings,
  serializeSettings,
  settingsParser,
} from "../lib/dmgly/url-state";

test("default settings serialize without embedded assets and compare equal for URL clearing", () => {
  expect(serializeSettings(defaultSettings)).toBe('{"version":1}');
  expect(
    settingsParser.eq!(parseSettings('{"version":1}')!, defaultSettings),
  ).toBe(true);
  expect(settingsParser.clearOnDefault).toBe(true);
});

test("only changed fields enter the link", () => {
  const document = createComposition();
  document.app.x = 120;
  const settings = compositionSettings(document, null, DEFAULT_BACKGROUND_ID);
  expect(serializeSettings(settings)).toBe('{"version":1,"app":{"x":120}}');
  expect(parseSettings(serializeSettings(settings))).toEqual(settings);
});

test("composition properties and Unicode survive a query-string round-trip", () => {
  const document = createComposition();
  document.app.name = "Київ & Friends";
  document.window = { width: 800, height: 500 };
  document.text = {
    ...document.text,
    content: "こんにちは / & ? # +",
    rotation: -33,
    visible: false,
  };
  document.arrow = {
    ...document.arrow,
    scale: 1.5,
    rotation: 24,
    shape: "chevron",
  };
  document.background.gradient.stops[0].color = "#123456";
  document.background.mode = "gradient";
  const settings = compositionSettings(document, null, DEFAULT_BACKGROUND_ID);
  const query = new URLSearchParams({ design: serializeSettings(settings) });
  expect(
    parseSettings(new URLSearchParams(query.toString()).get("design")!),
  ).toEqual(settings);
  expect(query.toString()).not.toContain("base64");
});

test("links carry local asset references rather than image bytes", () => {
  const id = `local:${"a".repeat(64)}`;
  const settings = compositionSettings(createComposition(), id, id);
  expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  expect(serializeSettings(settings).length).toBeLessThan(250);
});

test("malformed, unsupported and invalid settings fail closed", () => {
  for (const raw of [
    "{",
    "null",
    "[]",
    '{"version":2}',
    '{"version":1,"window":{"width":0}}',
    '{"version":1,"text":{"rotation":999}}',
    '{"version":1,"app":{"image":"data:image/png;base64,abc"}}',
    '{"version":1,"background":{"image":"https://example.com/private.png"}}',
    '{"version":1,"app":[]}',
    " ".repeat(10001),
  ]) {
    expect(parseSettings(raw)).toBeNull();
  }
});
