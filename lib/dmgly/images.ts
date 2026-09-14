import { ImageAsset } from "./model";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("This image could not be opened. Try a PNG, JPEG, or WebP file."));
    image.src = source;
  });
}
export async function readImageAsset(file: File): Promise<ImageAsset> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Choose a PNG, JPEG, or WebP image. ICNS and SVG are not supported yet.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Choose an image smaller than 10 MB.");
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read. Please try again."));
    reader.readAsDataURL(file);
  });
  const image = await loadImage(source);
  if (
    image.naturalWidth > 8192 ||
    image.naturalHeight > 8192 ||
    image.naturalWidth * image.naturalHeight > 16_777_216
  )
    throw new Error("This image is too large. Use at most 16 megapixels and 8192 px per side.");
  return { name: file.name, data: source, width: image.naturalWidth, height: image.naturalHeight };
}
