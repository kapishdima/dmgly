import { expect, test } from "bun:test";
import { createComposition } from "../lib/dmgly/model";
import { artworkSvg } from "../lib/dmgly/artwork";
test("export markup escapes user text and excludes hidden decorations", () => {
  const d = createComposition();
  d.text.content = '<script>alert("x")</script>';
  const svg = artworkSvg(d);
  expect(svg).not.toContain("<script>");
  expect(svg).toContain("&lt;script&gt;");
  d.text.visible = false;
  d.arrow.visible = false;
  expect(artworkSvg(d)).not.toContain("<text");
  expect(artworkSvg(d)).not.toContain("<path");
});
test("gradient stop sorting does not reorder the editable model", () => {
  const d = createComposition();
  d.background.gradient.stops.reverse();
  const before = JSON.stringify(d);
  expect(artworkSvg(d).indexOf('offset="0%"')).toBeLessThan(artworkSvg(d).indexOf('offset="100%"'));
  expect(JSON.stringify(d)).toBe(before);
});
