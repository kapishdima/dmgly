import type { Composition } from "../model";
import type { GifRequest, GifResponse } from "../gif.worker";
import { backgroundImageBounds } from "../artwork";
import { dataBytes } from "../media";

export type RenderOptions = { signal?: AbortSignal; onProgress?: (current: number, total: number) => void };
export function renderGif(d: Composition, overlay: Blob, emptyOverlay: boolean, options: RenderOptions = {}): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    options.signal?.throwIfAborted();
    const bounds = backgroundImageBounds(d), bytes = dataBytes(d.background.image!.data);
    const worker = new Worker(new URL("../gif.worker.ts", import.meta.url), { type: "module" });
    const cleanup = () => { worker.terminate(); options.signal?.removeEventListener("abort", abort); };
    const abort = () => { cleanup(); reject(new DOMException("Export cancelled.", "AbortError")); };
    options.signal?.addEventListener("abort", abort, { once: true });
    worker.onerror = () => { cleanup(); reject(new Error("GIF export failed. Try again in a browser with worker and OffscreenCanvas support.")); };
    worker.onmessage = ({ data }: MessageEvent<GifResponse>) => {
      if (data.type === "progress") options.onProgress?.(data.current, data.total);
      if (data.type === "error") { cleanup(); reject(new Error(data.message)); }
      if (data.type === "result") { cleanup(); resolve(data.bytes); }
    };
    const request: GifRequest = {
      type: "export", bytes, width: d.window.width, height: d.window.height,
      solid: d.background.solid, bounds, overlay,
      passthrough: emptyOverlay && bounds.x === 0 && bounds.y === 0 && bounds.width === d.window.width && bounds.height === d.window.height && d.background.image!.width === d.window.width && d.background.image!.height === d.window.height,
    };
    try { worker.postMessage(request, [bytes.buffer]); }
    catch (error) { cleanup(); reject(error); }
  });
}
