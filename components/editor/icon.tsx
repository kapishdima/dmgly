import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

export function Icon({
  icon,
  size = 18,
  className = "",
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  size?: number;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={1.7}
      className={`ui-icon ${className}`}
      aria-hidden="true"
    />
  );
}
