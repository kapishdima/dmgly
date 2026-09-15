import { GifReader, type Frame } from "omggif";
import { GIFEncoder } from "gifenc";
import { buildPaletteSync, applyPaletteSync, utils } from "image-q";

// Decode into one logical-screen buffer. Disposal is applied before the next
// patch, including transparent patches and restore-to-previous frames.
export class GifFrames {
  readonly reader: GifReader;
  readonly pixels: Uint8ClampedArray;
  private background = [0, 0, 0, 0];
  private previous: Frame | null = null;
  private saved: Uint8ClampedArray | null = null;
  constructor(bytes: Uint8Array) {
    this.reader = new GifReader(bytes);
    const { width, height } = this.reader;
    if (!width || !height || width > 8192 || height > 8192 || width * height > 16_777_216 || !this.reader.numFrames())
      throw new Error("Invalid GIF dimensions or missing frames.");
    for (let i = 0; i < this.reader.numFrames(); i++) {
      const f = this.reader.frameInfo(i);
      if (!f.width || !f.height || f.x + f.width > width || f.y + f.height > height || f.data_offset + f.data_length > bytes.length)
        throw new Error("The GIF contains an invalid or incomplete frame.");
    }
    if (bytes[10] & 0x80) {
      const offset = 13 + bytes[11] * 3;
      this.background = [bytes[offset], bytes[offset + 1], bytes[offset + 2], 255];
    }
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.reset();
  }
  reset() {
    const color = this.reader.frameInfo(0).transparent_index === null ? this.background : [0, 0, 0, 0];
    for (let i = 0; i < this.pixels.length; i += 4) this.pixels.set(color, i);
    this.previous = null;
    this.saved = null;
  }
  frame(index: number) {
    const previous = this.previous;
    if (previous?.disposal === 2) {
      for (let y = previous.y; y < previous.y + previous.height; y++) {
        const start = (y * this.reader.width + previous.x) * 4;
        const color = previous.transparent_index === null ? this.background : [0, 0, 0, 0];
        for (let i = start; i < start + previous.width * 4; i += 4) this.pixels.set(color, i);
      }
    } else if (previous?.disposal === 3 && this.saved) this.pixels.set(this.saved);
    const info = this.reader.frameInfo(index);
    this.saved = info.disposal === 3 ? this.pixels.slice() : null;
    this.reader.decodeAndBlitFrameRGBA(index, this.pixels);
    this.previous = info;
    return { pixels: this.pixels, delay: info.delay * 10 };
  }
}

// Keep exact RGB values when the composed frame still fits in a GIF palette.
// Only compositions with more than 256 colors need GIF's palette conversion.
export function indexColors(rgba: Uint8ClampedArray, width: number, height: number) {
  const colors = new Map<number, number>();
  const palette: number[][] = [];
  const index = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < rgba.length; i += 4) {
    const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    let id = colors.get(key);
    if (id === undefined) {
      if (palette.length === 256) {
        const image = utils.PointContainer.fromUint8Array(rgba, width, height);
        const reduced = buildPaletteSync([image], { colors: 256, paletteQuantization: "rgbquant", colorDistanceFormula: "euclidean-bt709-noalpha" });
        const points = reduced.getPointContainer().getPointArray();
        const lookup = new Map(points.map((point, i) => [point.uint32, i]));
        const mapped = applyPaletteSync(image, reduced, { imageQuantization: "floyd-steinberg", colorDistanceFormula: "euclidean-bt709-noalpha" });
        return { palette: points.map((p) => [p.r, p.g, p.b]), index: Uint8Array.from(mapped.getPointArray(), (p) => lookup.get(p.uint32)!) };
      }
      id = palette.length;
      colors.set(key, id);
      palette.push([rgba[i], rgba[i + 1], rgba[i + 2]]);
    }
    index[i / 4] = id;
  }
  return { palette, index };
}
export function gifEncoder(width: number, height: number, loop: number | null) {
  const encoder = GIFEncoder();
  return {
    add(rgba: Uint8ClampedArray, delay: number) {
      const { palette, index } = indexColors(rgba, width, height);
      encoder.writeFrame(index, width, height, { palette, delay, repeat: loop ?? -1, dispose: 1 });
    },
    finish() { encoder.finish(); return encoder.bytes(); },
  };
}
