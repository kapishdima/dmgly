import { GifFrames, gifEncoder } from "./gif";

export type GifRequest =
  | { type: "preview"; bytes: Uint8Array; paused: boolean }
  | { type: "pause"; paused: boolean }
  | { type: "export"; bytes: Uint8Array; width: number; height: number; solid: string; bounds: { x: number; y: number; width: number; height: number }; overlay: Blob; passthrough: boolean };
export type GifResponse =
  | { type: "frame"; bitmap: ImageBitmap }
  | { type: "end" }
  | { type: "progress"; current: number; total: number }
  | { type: "result"; bytes: Uint8Array }
  | { type: "error"; message: string };
const send = (message: GifResponse, transfer: Transferable[] = []) => self.postMessage(message, { transfer });
let timer: ReturnType<typeof setTimeout> | undefined;
let resume: (() => void) | undefined;

self.onmessage = async ({ data }: MessageEvent<GifRequest>) => {
  try {
    if (data.type === "pause") {
      clearTimeout(timer);
      if (!data.paused) resume?.();
      return;
    }
    const frames = new GifFrames(data.bytes), reader = frames.reader;
    const source = new OffscreenCanvas(reader.width, reader.height);
    const sourceContext = source.getContext("2d");
    if (!sourceContext) throw new Error("Your browser could not create a GIF canvas.");
    const draw = (index: number) => {
      const frame = frames.frame(index);
      sourceContext.putImageData(new ImageData(new Uint8ClampedArray(frame.pixels), reader.width, reader.height), 0, 0);
      return frame.delay;
    };
    if (data.type === "preview") {
      let index = 0, iteration = 0, delay = 0, ended = false;
      const tick = () => {
        if (index === reader.numFrames()) {
          if (reader.loopCount() !== 0 && iteration >= (reader.loopCount() ?? 0)) {
            ended = true; send({ type: "end" }); return;
          }
          iteration++; index = 0; frames.reset();
        }
        delay = draw(index++);
        const bitmap = source.transferToImageBitmap();
        send({ type: "frame", bitmap }, [bitmap]);
        timer = setTimeout(tick, Math.max(20, delay || 100));
      };
      resume = () => {
        if (ended) { index = 0; iteration = 0; ended = false; frames.reset(); }
        timer = setTimeout(tick, Math.max(20, delay || 100));
      };
      tick();
      if (data.paused) clearTimeout(timer);
      return;
    }
    if (data.passthrough && Array.from({ length: reader.numFrames() }, (_, i) => reader.frameInfo(i)).every((f) => f.transparent_index === null && f.x === 0 && f.y === 0 && f.width === reader.width && f.height === reader.height)) {
      send({ type: "result", bytes: data.bytes }, [data.bytes.buffer]); return;
    }
    const canvas = new OffscreenCanvas(data.width, data.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Your browser could not create a GIF export canvas.");
    const overlay = await createImageBitmap(data.overlay);
    const encoder = gifEncoder(data.width, data.height, reader.loopCount());
    try {
      for (let i = 0; i < reader.numFrames(); i++) {
        const delay = draw(i), b = data.bounds;
        context.fillStyle = data.solid;
        context.fillRect(0, 0, data.width, data.height);
        context.drawImage(source, b.x, b.y, b.width, b.height);
        context.drawImage(overlay, 0, 0);
        encoder.add(context.getImageData(0, 0, data.width, data.height).data, delay);
        send({ type: "progress", current: i + 1, total: reader.numFrames() });
      }
      const bytes = encoder.finish();
      send({ type: "result", bytes }, [bytes.buffer]);
    } finally { overlay.close(); }
  } catch (error) {
    send({ type: "error", message: error instanceof Error ? error.message : "The GIF could not be processed." });
  }
};
