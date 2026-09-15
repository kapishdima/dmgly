import { expect, test } from "bun:test";
import { artworkSvg, labelBackgroundsMarkup } from "../lib/dmgly/artwork";
import { createComposition, labelBackgroundBounds, moveElement, moveLabelBackground, parseComposition, resizeWindow } from "../lib/dmgly/model";
import { compositionSettings, DEFAULT_BACKGROUND_ID, parseSettings, serializeSettings } from "../lib/dmgly/url-state";
import { moveSelection } from "../lib/dmgly/transforms";
import { tauriConfig } from "../lib/dmgly/export/tauri";
import { createHistory, reduceHistory } from "../lib/dmgly/history";

test("legacy compositions gain independent label background settings", () => {
  const d = createComposition();
  const legacy = JSON.parse(JSON.stringify(d));
  delete legacy.app.labelBackground;
  delete legacy.applications.labelBackground;
  const restored = parseComposition(legacy);
  expect(restored).toEqual(d);
  restored.app.labelBackground.color = "#ffff00";
  expect(restored.applications.labelBackground.color).toBe("#ffffff");
  expect(() => parseComposition({ ...d, app: { ...d.app, labelBackground: { ...d.app.labelBackground, opacity: 101 } } })).toThrow();
});

test.each(["solid", "gradient", "image"] as const)("%s exports include styled plates without baking native filenames", (mode) => {
  const d = createComposition();
  d.background.mode = mode;
  d.texts[0].visible = false;
  d.arrow.visible = false;
  d.app.name = "Native filename should not be baked";
  d.app.labelBackground = { ...d.app.labelBackground, autoSize: false, visible: true, color: "#ffeedd", opacity: 75, width: 200, height: 50, radius: 48 };
  d.applications.labelBackground.visible = false;
  const plate = labelBackgroundsMarkup(d);
  expect(plate).toContain('data-label-background="app" x="-5" y="143" width="200" height="50" rx="25" fill="#ffeedd" fill-opacity="0.75"');
  expect(plate).not.toContain('data-label-background="applications"');
  const svg = artworkSvg(d);
  expect(svg).toContain(plate);
  expect(svg).not.toContain(d.app.name);
  expect(svg).not.toContain("<text");
  d.app.labelBackground.visible = false;
  expect(artworkSvg(d)).not.toContain("data-label-background");
});

test("plate settings survive URL round-trips and stay out of Tauri coordinates", () => {
  const d = createComposition();
  d.app.labelBackground = { ...d.app.labelBackground, autoSize: false, offsetX: 30, offsetY: -12, visible: false, color: "#abc123", opacity: 41, width: 236, height: 68, radius: 17 };
  d.applications.labelBackground.width = 220;
  const settings = compositionSettings(d, null, DEFAULT_BACKGROUND_ID);
  expect(parseSettings(serializeSettings(settings))).toEqual(settings);
  const config = JSON.parse(tauriConfig(d).content);
  expect(config.bundle.macOS.dmg.applicationFolderPosition).toEqual({ x: 367, y: 213 });
  expect(tauriConfig(d).content).not.toContain("labelBackground");
});

test("independent badge movement and window resizing clamp to the visible canvas", () => {
  const d = createComposition();
  d.app.labelBackground.autoSize = false;
  d.app.labelBackground.width = 320;
  d.app.labelBackground.height = 96;
  const moved = moveLabelBackground(d, "app", 9999, 9999);
  const bounds = labelBackgroundBounds(moved, "app");
  expect(bounds.x + bounds.width).toBe(d.window.width);
  expect(bounds.y + bounds.height).toBe(d.window.height - 32);
  expect([moved.app.x, moved.app.y]).toEqual([d.app.x, d.app.y]);
  expect(moved.applications).toEqual(d.applications);
  const resized = resizeWindow(moved, 480, 320);
  const small = labelBackgroundBounds(resized, "app");
  expect(small.x + small.width).toBe(480);
  expect(small.y + small.height).toBe(288);
});

test("automatic badges use measured text width plus four pixels on every side", () => {
  const d = createComposition();
  const widths = { app: 43.5, applications: 78 };
  expect(labelBackgroundBounds(d, "app", widths.app)).toEqual({ x: 69.25, y: 156, width: 51.5, height: 24 });
  expect(labelBackgroundBounds(d, "applications", widths.applications).width).toBe(86);
  expect(labelBackgroundBounds(d, "app", 1000).width).toBe(172);
  expect(artworkSvg(d, widths)).toContain('x="69.25" y="156" width="51.5" height="24"');
});

test("a badge drag is one undo step and its offset follows subsequent icon movement", () => {
  const d = createComposition();
  let history = reduceHistory(createHistory(d), { type: "begin" });
  for (const offset of [10, 20, 30]) history = reduceHistory(history, { type: "edit", value: moveLabelBackground(d, "app", offset, -10) });
  history = reduceHistory(history, { type: "end" });
  expect(history.past).toHaveLength(1);
  expect(reduceHistory(history, { type: "undo" }).present).toEqual(d);
  const moved = moveElement(history.present, "app", 195, 190);
  expect(labelBackgroundBounds(moved, "app").x - labelBackgroundBounds(history.present, "app").x).toBe(100);
  expect(moveSelection(history.present, ["app"], 100, 100).app).toEqual(moved.app);
});
