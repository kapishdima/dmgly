"use client";
import { useEffect, useRef, useState } from "react";
import type { Composition } from "@/lib/dmgly/model";
import type { GifRequest, GifResponse } from "@/lib/dmgly/gif.worker";
import { dataBytes } from "@/lib/dmgly/media";
import { backgroundImageBounds } from "@/lib/dmgly/artwork";

export function GifBackground({ document: d, paused, onEnd }: { document: Composition; paused: boolean; onEnd: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const worker = useRef<Worker | null>(null);
  const state = useRef({ paused, onEnd });
  const [error, setError] = useState("");
  const data = d.background.image!.data;
  useEffect(() => { state.current = { paused, onEnd }; }, [paused, onEnd]);
  useEffect(() => {
    const instance = new Worker(new URL("../../lib/dmgly/gif.worker.ts", import.meta.url), { type: "module" });
    worker.current = instance;
    const context = canvas.current!.getContext("2d");
    instance.onmessage = ({ data: message }: MessageEvent<GifResponse>) => {
      if (message.type === "frame") {
        setError("");
        if (canvas.current) {
          canvas.current.width = message.bitmap.width;
          canvas.current.height = message.bitmap.height;
          context?.drawImage(message.bitmap, 0, 0);
        }
        message.bitmap.close();
      } else if (message.type === "end") state.current.onEnd();
      else if (message.type === "error") setError(message.message);
    };
    instance.onerror = () => setError("GIF preview is unavailable in this browser.");
    const bytes = dataBytes(data);
    instance.postMessage({ type: "preview", bytes, paused: state.current.paused } satisfies GifRequest, [bytes.buffer]);
    return () => { instance.terminate(); worker.current = null; };
  }, [data]);
  useEffect(() => { worker.current?.postMessage({ type: "pause", paused } satisfies GifRequest); }, [paused]);
  const bounds = backgroundImageBounds(d);
  return <div className="gif-background" style={{ background: d.background.solid }}>
    <canvas ref={canvas} aria-label="Animated background" style={{ position: "absolute", left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }} />
    {error && <p className="gif-preview-error" role="alert">{error}</p>}
  </div>;
}
