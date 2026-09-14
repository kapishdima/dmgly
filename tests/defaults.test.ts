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
  expect(d.background.image?.name).toBe("Dithering@2x.png");
  expect(d.background.image?.width).toBe(1600);
  expect(d.background.image?.height).toBe(1200);
  expect(artworkSvg(d)).toContain(`<image href="${d.background.image!.data}"`);
  expect(artworkSvg(d)).not.toContain("<linearGradient");
});

test("only the unchanged legacy starter receives the new background", () => {
  expect(upgradeStarterDraft(previousStarter())).toEqual(createComposition());
  expect(upgradeStarterDraft(parseComposition(previousStarter()))).toEqual(createComposition());
  const renamed = previousStarter();
  renamed.app.name = "My custom app";
  expect(upgradeStarterDraft(renamed)).toBe(renamed);
  const customBackground = previousStarter();
  customBackground.background.mode = "solid";
  expect(upgradeStarterDraft(customBackground)).toBe(customBackground);
  const current = createComposition();
  current.background.image = null;
  expect(upgradeStarterDraft(current)).toBe(current);
});
