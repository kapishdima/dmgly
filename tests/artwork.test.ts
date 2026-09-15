import { expect, test } from "bun:test";
import { createComposition } from "../lib/dmgly/model";
import { arrowPath, artworkSvg } from "../lib/dmgly/artwork";
test("export markup escapes user text and excludes hidden decorations", () => {
  const d = createComposition();
  d.texts[0].content = '<script>alert("x")</script>';
  const svg = artworkSvg(d);
  expect(svg).not.toContain("<script>");
  expect(svg).toContain("&lt;script&gt;");
  d.texts[0].visible = false;
  d.arrow.visible = false;
  expect(artworkSvg(d)).not.toContain("<text");
  expect(artworkSvg(d)).not.toContain("<path");
});
test("gradient stop sorting does not reorder the editable model", () => {
  const d = createComposition();
  d.background.mode = "gradient";
  d.background.gradient.stops.reverse();
  const before = JSON.stringify(d);
  expect(artworkSvg(d).indexOf('offset="0%"')).toBeLessThan(artworkSvg(d).indexOf('offset="100%"'));
  expect(JSON.stringify(d)).toBe(before);
});

test.each([32, 86, 240])("curved arrowhead follows the curve tangent at width %i", (width) => {
  const d = createComposition();
  d.arrow.shape = "curved";
  d.arrow.width = width;
  const path = arrowPath(d);
  const [, , cx, cy, tipX, tipY, ax, ay, joinX, joinY, bx, by] =
    path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  const tx = tipX - cx, ty = tipY - cy;
  const backX = tipX - (ax + bx) / 2, backY = tipY - (ay + by) / 2;
  expect([joinX, joinY]).toEqual([tipX, tipY]);
  expect(backX * ty - backY * tx).toBeCloseTo(0, 8);
  expect(backX * tx + backY * ty).toBeGreaterThan(0);
  expect(Math.hypot(ax - tipX, ay - tipY)).toBeCloseTo(Math.hypot(bx - tipX, by - tipY), 8);
  expect(artworkSvg(d)).toContain(`d="${path}"`);
});
