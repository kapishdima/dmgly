"use client";
import { Select } from "@base-ui/react/select";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import type { ExportTarget } from "@/lib/dmgly/export/contract";

const platforms = [
  { value: "electron", label: "Electron", detail: "electron-builder" },
  { value: "tauri", label: "Tauri", detail: "Tauri 2" },
  { value: "native", label: "Swift / macOS", detail: "create-dmg" },
] as const;

export function PlatformSelect({
  value,
  onChange,
  disabled,
}: {
  value: ExportTarget;
  onChange: (value: ExportTarget) => void;
  disabled: boolean;
}) {
  return (
    <div className="export-target">
      <p id="platform-label">Build with</p>
      <Select.Root
        items={platforms}
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        disabled={disabled}
        name="platform"
      >
        <Select.Trigger
          className="platform-trigger"
          aria-labelledby="platform-label"
        >
          <Select.Value />
          <Icon icon={ArrowDown01Icon} />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="platform-positioner"
            sideOffset={8}
            align="start"
            alignItemWithTrigger={false}
          >
            <Select.Popup className="platform-popup dmgly">
              <Select.List>
                {platforms.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    className="platform-option"
                  >
                    <div>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <p>{item.detail}</p>
                    </div>
                    <Select.ItemIndicator>
                      <Icon icon={Tick02Icon} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
