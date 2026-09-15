import type { Composition, ImageAsset } from "./model";

export function isGif(asset: ImageAsset | null | undefined): asset is ImageAsset {
  return !!asset?.data.startsWith("data:image/gif;base64,");
}
export function hasGifBackground(d: Composition) {
  return d.background.mode === "image" && isGif(d.background.image);
}
export function backgroundAssetPath(d: Composition) {
  return `assets/dmg-background.${hasGifBackground(d) ? "gif" : "png"}`;
}
export function assetBytes(asset: ImageAsset) {
  const base64 = asset.data.slice(asset.data.indexOf(",") + 1);
  return base64.length * 3 / 4 - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
}
export function formatBytes(bytes: number) {
  return bytes < 1_000_000 ? `${(bytes / 1000).toFixed(1)} kB` : `${(bytes / 1_000_000).toFixed(1)} MB`;
}
export function dataBytes(data: string) {
  return Uint8Array.from(atob(data.slice(data.indexOf(",") + 1)), (c) => c.charCodeAt(0));
}
