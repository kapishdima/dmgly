"use client";
import Image from "next/image";
import type { ExportTarget } from "@/lib/dmgly/export/contract";

const platforms = [
  { value: "electron", label: "Electron", icon: "electron" },
  { value: "tauri", label: "Tauri", icon: "tauri" },
  { value: "native", label: "Swift / macOS", icon: "swift" },
] as const;

export function PlatformButtons({
  value,
  onChange,
  disabled,
}: {
  value: ExportTarget;
  onChange: (value: ExportTarget) => void;
  disabled: boolean;
}) {
  return (
    <div className="segment platform-buttons" role="group" aria-label="Export platform">
      {platforms.map((platform) => (
        <button
          key={platform.value}
          type="button"
          className={value === platform.value ? "active" : ""}
          aria-label={platform.label}
          aria-pressed={value === platform.value}
          title={platform.label}
          disabled={disabled}
          onClick={() => onChange(platform.value)}
        >
          <Image src={`/assets/platforms/${platform.icon}.svg`} width={22} height={22} alt="" />
        </button>
      ))}
    </div>
  );
}
