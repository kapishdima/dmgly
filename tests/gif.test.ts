import { expect, test } from "bun:test";
import { GifReader, GifWriter } from "omggif";
import { GifFrames, gifEncoder, indexColors } from "../lib/dmgly/gif";
import { createComposition, compositionSchema } from "../lib/dmgly/model";
import { backgroundImageBounds } from "../lib/dmgly/artwork";
import { backgroundAssetPath, assetBytes } from "../lib/dmgly/media";
import { buildConfig, exportText } from "../lib/dmgly/export/bundle";
import { spawnSync } from "node:child_process";

function fixture(loop?: number) {
  const buffer: number[] = [];
  const writer = new GifWriter(buffer, 3, 1, { palette: [0, 0xff0000, 0x00ff00, 0x0000ff], ...(loop === undefined ? {} : { loop }) });
  writer.addFrame(0, 0, 3, 1, [1, 1, 1], { delay: 3, disposal: 1 });
  writer.addFrame(1, 0, 1, 1, [2], { delay: 17, disposal: 3 });
  writer.addFrame(2, 0, 1, 1, [3], { delay: 0, disposal: 2, transparent: 0 });
  writer.addFrame(0, 0, 1, 1, [2], { delay: 41, disposal: 1, transparent: 0 });
  writer.end();
  return Uint8Array.from(buffer);
}
const pixels = (decoder: GifFrames, i: number) => Array.from(decoder.frame(i).pixels);
test("GIF patches respect restore-to-previous, transparent disposal and timing", () => {
  const decoder = new GifFrames(fixture(2));
  expect(pixels(decoder, 0)).toEqual([255,0,0,255, 255,0,0,255, 255,0,0,255]);
  expect(pixels(decoder, 1)).toEqual([255,0,0,255, 0,255,0,255, 255,0,0,255]);
  expect(pixels(decoder, 2)).toEqual([255,0,0,255, 255,0,0,255, 0,0,255,255]);
  expect(pixels(decoder, 3)).toEqual([0,255,0,255, 255,0,0,255, 0,0,0,0]);
  decoder.reset();
  expect(pixels(decoder, 0)).toEqual([255,0,0,255, 255,0,0,255, 255,0,0,255]);
});
test("GIF output preserves variable delays including zero and once/finite/infinite loops", () => {
  for (const loop of [undefined, 0, 2]) {
    const decoder = new GifFrames(fixture(loop));
    const encoder = gifEncoder(3, 1, decoder.reader.loopCount());
    for (let i = 0; i < decoder.reader.numFrames(); i++) {
      const { pixels, delay } = decoder.frame(i);
      encoder.add(pixels, delay);
    }
    const reader = new GifReader(encoder.finish());
    expect(reader.numFrames()).toBe(4);
    expect([0,1,2,3].map(i => reader.frameInfo(i).delay)).toEqual([3,17,0,41]);
    expect(reader.loopCount() as number | null).toBe(loop ?? null);
    const rgba = new Uint8Array(12);
    reader.decodeAndBlitFrameRGBA(1, rgba);
    expect(Array.from(rgba)).toEqual([255,0,0,255, 0,255,0,255, 255,0,0,255]);
  }
});
test("GIF restore-to-background uses the logical-screen color for opaque frames", () => {
  const buffer: number[] = [];
  const writer = new GifWriter(buffer, 2, 1, { palette: [0xff0000, 0x00ff00], background: 1 });
  writer.addFrame(0,0,1,1,[0],{ disposal: 2 });
  writer.addFrame(1,0,1,1,[0],{ disposal: 1 }); writer.end();
  const frames = new GifFrames(Uint8Array.from(buffer));
  expect(pixels(frames,0)).toEqual([255,0,0,255, 0,255,0,255]);
  expect(pixels(frames,1)).toEqual([0,255,0,255, 255,0,0,255]);
});
test("malformed GIFs fail before allocating frame buffers", () => {
  expect(() => new GifFrames(new Uint8Array([1,2,3]))).toThrow();
  expect(() => new GifFrames(fixture().slice(0, -10))).toThrow();
});
test("GIF assets use .gif consistently in every target, script and prompt", () => {
  const d = createComposition();
  d.background.mode = "image";
  d.background.image = { name: "loop.gif", data: `data:image/gif;base64,${Buffer.from(fixture()).toString("base64")}`, width: 3, height: 1 };
  expect(compositionSchema.safeParse(d).success).toBe(true);
  expect(assetBytes(d.background.image)).toBe(fixture().length);
  for (const target of ["electron", "tauri", "native"] as const) {
    const { config, prompt } = exportText(d, target);
    expect(config.assets).toContain("assets/dmg-background.gif");
    expect(config.content).toContain("assets/dmg-background.gif");
    expect(prompt).not.toContain("dmg-background.png");
  }
  expect(spawnSync("bash", ["-n"], { input: buildConfig(d, "native").content }).status).toBe(0);
  d.background.mode = "solid";
  expect(backgroundAssetPath(d)).toBe("assets/dmg-background.png");
});
test("GIF schema accepts files above the old upload and encoded data limits", () => {
  const d = createComposition();
  d.background.image = { name: "large.gif", width: 640, height: 400, data: "data:image/gif;base64," + "AAAA".repeat(4_000_000) };
  expect(compositionSchema.safeParse(d).success).toBe(true);
});
test("GIF preview and export share fill, fit, scale and offset geometry", () => {
  const d = createComposition(); d.window = { width: 600, height: 400 };
  d.background.image = { name: "a.gif", data: "data:image/gif;base64,R0lG", width: 300, height: 100 };
  d.background.fit = "fit"; d.background.scale = 1; d.background.x = 10; d.background.y = -10;
  expect(backgroundImageBounds(d)).toEqual({ x: 60, y: 60, width: 600, height: 200 });
  d.background.fit = "fill";
  expect(backgroundImageBounds(d)).toEqual({ x: -240, y: -40, width: 1200, height: 400 });
});

test("compositing keeps fine gradient colors instead of reducing them to low-bit RGB bands", () => {
  const width = 256, height = 4, rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    rgba.set([20 + Math.floor(x * 0.15), 15 + Math.floor(x * 0.08) + y, 30 + Math.floor(x * 0.5), 255], (y * width + x) * 4);
  }
  const { palette, index } = indexColors(rgba, width, height);
  let error = 0;
  for (let i = 0; i < index.length; i++) for (let c = 0; c < 3; c++) error += Math.abs(rgba[i * 4 + c] - palette[index[i]][c]);
  expect(palette.length).toBeGreaterThan(180);
  expect(error / (width * height * 3)).toBeLessThan(1.5);
});
