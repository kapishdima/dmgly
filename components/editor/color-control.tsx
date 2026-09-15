"use client";
import { useState, type ComponentProps } from "react";
import { ColorControl as DialColorControl } from "dialkit";

function hexColor(value: string): string {
  const c = document.createElement("canvas").getContext("2d")!;
  c.fillStyle = "#000000";
  c.fillStyle = value;
  c.fillRect(0, 0, 1, 1);
  return (
    "#" +
    Array.from(c.getImageData(0, 0, 1, 1).data)
      .slice(0, 3)
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}
// DialKit infers the active format from its controlled value. Keep its CSS
// representation separate from the sRGB hex stored in the composition.
export function ColorControl({ value, onChange, ...props }: ComponentProps<typeof DialColorControl>) {
  const [draft, setDraft] = useState({ css: value, hex: value });
  if (draft.hex !== value) setDraft({ css: value, hex: value });

  return <DialColorControl {...props} value={draft.hex === value ? draft.css : value} onChange={(css) => {
    const hex = hexColor(css);
    setDraft({ css, hex });
    if (hex !== value) onChange(hex);
  }} />;
}
