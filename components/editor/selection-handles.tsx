"use client";
import type { PointerEvent } from "react";
import { RotateClockwiseIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import type { Point, SelectionFrame } from "@/lib/dmgly/transforms";

const corners = [
  { x: -1, y: -1, label: "top left" },
  { x: 1, y: -1, label: "top right" },
  { x: -1, y: 1, label: "bottom left" },
  { x: 1, y: 1, label: "bottom right" },
];
export function SelectionHandles({
  frame,
  zoom,
  count,
  transformable,
  onBegin,
  onMove,
  onEnd,
  onCancel,
  onKeyTransform,
}: {
  frame: SelectionFrame;
  zoom: number;
  count: number;
  transformable: boolean;
  onBegin: (
    e: PointerEvent<HTMLButtonElement>,
    kind: "rotate" | "scale",
    corner: Point,
  ) => void;
  onMove: (e: PointerEvent) => void;
  onEnd: () => void;
  onCancel: () => void;
  onKeyTransform: (kind: "rotate" | "scale", amount: number) => void;
}) {
  return (
    <div
      className={`selection-frame${transformable ? " transformable" : ""}`}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        transform: `translate(-50%, -50%) rotate(${frame.rotation}deg)`,
        borderWidth: 1 / zoom,
      }}
      aria-label={`${count} selected ${count === 1 ? "element" : "elements"}`}
    >
      {transformable &&
        corners.flatMap((corner) =>
          (["rotate", "scale"] as const).map((kind) => (
            <button
              key={`${kind}-${corner.label}`}
              type="button"
              className={`transform-handle ${kind}-handle`}
              aria-label={`${kind === "scale" ? "Scale" : "Rotate"} selection from ${corner.label}`}
              title={
                kind === "scale"
                  ? "Drag to scale"
                  : "Drag to rotate. Hold Shift for 15° steps"
              }
              style={{
                left: corner.x < 0 ? 0 : "100%",
                top: corner.y < 0 ? 0 : "100%",
                transform: `translate(-50%, -50%) translate(${kind === "rotate" ? (corner.x * 18) / zoom : 0}px, ${kind === "rotate" ? (corner.y * 18) / zoom : 0}px) scale(${1 / zoom})`,
                cursor:
                  kind === "rotate"
                    ? "grab"
                    : corner.x === corner.y
                      ? "nwse-resize"
                      : "nesw-resize",
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => onBegin(e, kind, corner)}
              onPointerMove={onMove}
              onPointerUp={onEnd}
              onPointerCancel={onCancel}
              onLostPointerCapture={onEnd}
              onKeyDown={(e) => {
                if (
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    e.key,
                  )
                )
                  return;
                e.preventDefault();
                e.stopPropagation();
                const direction =
                  e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : -1;
                onKeyTransform(
                  kind,
                  kind === "rotate"
                    ? direction * (e.shiftKey ? 15 : 1)
                    : 1 + direction * (e.shiftKey ? 0.1 : 0.02),
                );
              }}
            >
              {kind === "rotate" ? (
                <Icon icon={RotateClockwiseIcon} size={14} />
              ) : (
                <span />
              )}
            </button>
          )),
        )}
    </div>
  );
}
