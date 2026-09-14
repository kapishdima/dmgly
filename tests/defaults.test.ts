import { expect, test } from "bun:test";
import { createComposition, parseComposition, type Composition } from "../lib/dmgly/model";
import { upgradeStarterDraft } from "../lib/dmgly/defaults";
import { artworkSvg } from "../lib/dmgly/artwork";

function previousImageStarter(): Composition {
  const d = createComposition();
  d.window = { width: 660, height: 400 };
  d.app.x = 180;
  d.app.y = 170;
  d.applications = { x: 480, y: 170 };
  d.text.x = 330;
  d.text.y = 302;
  Object.assign(d.arrow, { shape: "straight", width: 86, rotation: 0, x: 330, y: 170 });
  return d;
}

function previousStarter(): Composition {
  const d = previousImageStarter();
  d.background.mode = "gradient";
  d.background.image = null;
  d.text.color = "#684631";
  d.arrow.color = "#946241";
  return d;
}

test("the first render embeds the starter image for both preview and export", () => {
  const d = createComposition();
  expect(d.background.mode).toBe("image");
  expect(d.background.image?.name).toBe("Dithering@2x (3).png");
  expect(d.background.image?.width).toBe(1600);
  expect(d.background.image?.height).toBe(1200);
  expect(artworkSvg(d)).toContain(`<image href="${d.background.image!.data}"`);
  expect(artworkSvg(d)).not.toContain("<linearGradient");
});

test("only the unchanged legacy starter receives the new background", async () => {
  expect(await upgradeStarterDraft(previousStarter())).toEqual(createComposition());
  expect(await upgradeStarterDraft(parseComposition(previousStarter()))).toEqual(createComposition());
  const renamed = previousStarter();
  renamed.app.name = "My custom app";
  expect(await upgradeStarterDraft(renamed)).toBe(renamed);
  const customBackground = previousStarter();
  customBackground.background.mode = "solid";
  expect(await upgradeStarterDraft(customBackground)).toBe(customBackground);
  const current = createComposition();
  current.background.image = null;
  expect(await upgradeStarterDraft(current)).toBe(current);
});

test.each([
  ["Dithering@2x.png", "original-default-background.png"],
  ["Dithering@2x (1).png", "second-default-background.png"],
  ["Dithering@2x (2).png", "third-default-background.png"],
])("the %s starter updates without replacing custom artwork or composition", async (name, fixture) => {
  const bytes = await Bun.file(new URL(`./fixtures/${fixture}`, import.meta.url)).arrayBuffer();
  const original = previousImageStarter();
  original.background.image = {
    name,
    data: `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
    width: 1600,
    height: 1200,
  };
  expect(await upgradeStarterDraft(parseComposition(original))).toEqual(createComposition());
  const moved = structuredClone(original);
  moved.app.x += 10;
  expect(await upgradeStarterDraft(moved)).toBe(moved);
  const differentImage = previousImageStarter();
  differentImage.background.image!.name = name;
  expect(await upgradeStarterDraft(differentImage)).toBe(differentImage);
});


test("the previous opaque image starter receives the new layout", async () => {
  expect(await upgradeStarterDraft(parseComposition(previousImageStarter()))).toEqual(createComposition());
  const customized = previousImageStarter();
  customized.arrow.rotation = 20;
  expect(await upgradeStarterDraft(customized)).toBe(customized);
});
