import { expect, test } from "bun:test";
import { createComposition, parseComposition, type Composition } from "../lib/dmgly/model";
import { upgradeStarterDraft } from "../lib/dmgly/defaults";
import { artworkSvg } from "../lib/dmgly/artwork";

function previousStarter(): Composition {
  const d = createComposition();
  d.background.mode = "gradient";
  d.background.image = null;
  d.text.color = "#684631";
  d.arrow.color = "#946241";
  return d;
}

test("the first render embeds the starter image for both preview and export", () => {
  const d = createComposition();
  expect(d.background.mode).toBe("image");
  expect(d.background.image?.name).toBe("Dithering@2x (2).png");
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
])("the %s starter updates without replacing custom artwork or composition", async (name, fixture) => {
  const bytes = await Bun.file(new URL(`./fixtures/${fixture}`, import.meta.url)).arrayBuffer();
  const original = createComposition();
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
  const differentImage = createComposition();
  differentImage.background.image!.name = name;
  expect(await upgradeStarterDraft(differentImage)).toBe(differentImage);
});
