import { Composition, snapshot } from "../model";
import { artworkSvg } from "../artwork";
import { loadImage } from "../images";
import { measureLabelWidths } from "../label-metrics";
export type RenderedAssets = Record<string, Uint8Array>;
async function png(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Could not create the PNG. Try a smaller window or image."));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png"),
  );
}
export async function renderAssets(document: Composition): Promise<RenderedAssets> {
  const d = snapshot(document);
  if (d.background.mode === "image" && !d.background.image)
    throw new Error("Upload a background image, or choose Solid or Gradient.");
  await window.document.fonts.ready;
  const url = URL.createObjectURL(
    new Blob([artworkSvg(d, measureLabelWidths(d.app.name))], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = await loadImage(url),
      canvas = window.document.createElement("canvas");
    canvas.width = d.window.width;
    canvas.height = d.window.height;
    const context = canvas.getContext("2d", { colorSpace: "srgb" });
    if (!context) throw new Error("Your browser could not create an export canvas.");
    context.drawImage(image, 0, 0);
    const files: RenderedAssets = { "assets/dmg-background.png": await png(canvas) };
    if (d.app.image) {
      const icon = await loadImage(d.app.image.data);
      const c = window.document.createElement("canvas");
      c.width = c.height = 512;
      const ctx = c.getContext("2d")!;
      const scale = Math.min(512 / icon.naturalWidth, 512 / icon.naturalHeight);
      const w = icon.naturalWidth * scale,
        h = icon.naturalHeight * scale;
      ctx.drawImage(icon, (512 - w) / 2, (512 - h) / 2, w, h);
      files["assets/app-icon.png"] = await png(c);
    }
    return files;
  } finally {
    URL.revokeObjectURL(url);
  }
}
