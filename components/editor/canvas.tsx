/* Local data URLs must render immediately and never go through a remote image optimizer. */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CircleIcon,
  HardDriveIcon,
  Remove01Icon,
  Add01Icon,
  Maximize01Icon,
  Cursor01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { textBounds } from "@/lib/dmgly/artwork";
import {
  canTransform,
  elementFrame,
  moveSelection,
  rotatePoint,
  rotateSelection,
  scaleSelection,
  selectElement,
  selectionFrame,
  visibleElements,
  type Point,
  type SelectionFrame,
} from "@/lib/dmgly/transforms";
import { SelectionHandles } from "./selection-handles";
import { CanvasRulers } from "./canvas-rulers";

type Gesture = {
  kind: "move" | "scale" | "rotate";
  document: Composition;
  ids: MovableId[];
  pointer: Point;
  center: Point;
  anchor: Point;
  frame: SelectionFrame;
};
import {
  Composition,
  ElementId,
  MovableId,
  TITLEBAR_HEIGHT,
} from "@/lib/dmgly/model";

export function DmgCanvas({
  document: d,
  selected,
  onSelectionChange,
  onChange,
  onBegin,
  onEnd,
  artwork,
}: {
  document: Composition;
  selected: ElementId[];
  onSelectionChange: (ids: ElementId[]) => void;
  onChange: (d: Composition) => void;
  onBegin?: () => void;
  onEnd?: () => void;
  artwork?: React.ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const artboard = useRef<HTMLDivElement>(null);
  const drag = useRef<Gesture | null>(null);
  const keyboardMove = useRef(false);
  const [transformFrame, setTransformFrame] = useState<SelectionFrame | null>(
    null,
  );
  const [textFrame, setTextFrame] = useState<SelectionFrame | null>(null);
  const ids = visibleElements(d).filter((id) => selected.includes(id));
  const frame = transformFrame ?? selectionFrame(d, ids, textFrame);
  const [available, setAvailable] = useState(660);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  useEffect(() => {
    const el = host.current!;
    const observer = new ResizeObserver((entries) =>
      setAvailable(entries[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const text =
      artboard.current?.querySelector<SVGTextElement>(".artwork text");
    if (!text) return;
    const box = text.getBBox();
    const center = rotatePoint(
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      d.text,
      d.text.rotation,
    );
    setTextFrame({
      ...center,
      width: Math.max(16, box.width),
      height: Math.max(24, box.height),
      rotation: d.text.rotation,
    });
  }, [d.text]);
  const canvasPadding = available < 500 ? 40 : 48;
  const scale =
    zoom === "fit"
      ? Math.min(1, Math.max(1, available - canvasPadding * 2) / d.window.width)
      : zoom;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target;
      if (window.document.querySelector('[role="dialog"]')) return;
      if (
        !(target instanceof HTMLElement) ||
        target.closest(
          'input,textarea,[contenteditable]:not([contenteditable="false"]),[role="dialog"],.export-dialog',
        )
      )
        return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (drag.current) return;
        onSelectionChange(visibleElements(d));
        host.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [d, onSelectionChange]);

  function pointer(e: React.PointerEvent): Point {
    const rect = artboard.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }
  function snap(id: MovableId, moving: MovableId[], x: number, y: number) {
    const xs = [d.window.width / 2],
      ys = [(d.window.height - TITLEBAR_HEIGHT) / 2];
    for (const other of visibleElements(d)) {
      if (other !== id && !moving.includes(other)) {
        xs.push(d[other].x);
        ys.push(d[other].y);
      }
    }
    const gx = xs.find((v) => Math.abs(v - x) < 6 / scale);
    const gy = ys.find((v) => Math.abs(v - y) < 6 / scale);
    setGuides({ x: gx, y: gy });
    return { x: gx ?? x, y: gy ?? y };
  }
  function finish(cancel = false) {
    const start = drag.current;
    if (!start) return;
    drag.current = null;
    if (cancel) onChange(start.document);
    setGuides({});
    setTransformFrame(null);
    onEnd?.();
  }
  function updateGesture(e: React.PointerEvent) {
    const start = drag.current;
    if (!start) return;
    const point = pointer(e);
    if (start.kind === "move") {
      const id = start.ids[0],
        origin = start.document[id];
      const destination = snap(
        id,
        start.ids,
        origin.x + point.x - start.pointer.x,
        origin.y + point.y - start.pointer.y,
      );
      onChange(
        moveSelection(
          start.document,
          start.ids,
          destination.x - origin.x,
          destination.y - origin.y,
        ),
      );
    } else if (start.kind === "rotate") {
      const angle =
        ((Math.atan2(point.y - start.center.y, point.x - start.center.x) -
          Math.atan2(
            start.pointer.y - start.center.y,
            start.pointer.x - start.center.x,
          )) *
          180) /
        Math.PI;
      const degrees = e.shiftKey
        ? Math.round((start.frame.rotation + angle) / 15) * 15 -
          start.frame.rotation
        : angle;
      const next = rotateSelection(
        start.document,
        start.ids,
        start.center,
        degrees,
      );
      if (next === start.document && degrees !== 0) return;
      onChange(next);
      setTransformFrame({
        ...start.frame,
        rotation:
          start.frame.rotation + (next === start.document ? 0 : degrees),
      });
    } else {
      const vx = start.pointer.x - start.anchor.x,
        vy = start.pointer.y - start.anchor.y;
      const factor =
        ((point.x - start.anchor.x) * vx + (point.y - start.anchor.y) * vy) /
        (vx * vx + vy * vy);
      onChange(scaleSelection(start.document, start.ids, start.anchor, factor));
    }
  }
  function beginTransform(
    e: React.PointerEvent<HTMLButtonElement>,
    kind: "rotate" | "scale",
    corner: Point,
  ) {
    if (e.button !== 0 || !frame || !canTransform(ids)) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.focus({ preventScroll: true });
    e.currentTarget.setPointerCapture(e.pointerId);
    onBegin?.();
    const anchor = rotatePoint(
      {
        x: frame.x - (corner.x * frame.width) / 2,
        y: frame.y - (corner.y * frame.height) / 2,
      },
      frame,
      frame.rotation,
    );
    drag.current = {
      kind,
      document: d,
      ids,
      pointer: pointer(e),
      center: frame,
      anchor,
      frame,
    };
  }
  function keyboard(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") finish();
    if (e.key === "Escape") {
      e.preventDefault();
      if (drag.current) finish(true);
      else onSelectionChange(["background"]);
      host.current?.focus({ preventScroll: true });
      return;
    }
    if (
      e.target instanceof HTMLElement &&
      e.target.closest(".transform-handle")
    )
      return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const offset = offsets[e.key];
    if (!offset || !ids.length || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    if (!keyboardMove.current) {
      onBegin?.();
      keyboardMove.current = true;
    }
    const step = e.shiftKey ? 10 : 1;
    onChange(moveSelection(d, ids, offset[0] * step, offset[1] * step));
  }
  function finishKeyboard() {
    if (keyboardMove.current) {
      keyboardMove.current = false;
      onEnd?.();
    }
  }
  function item(
    id: MovableId,
    content: React.ReactNode,
    label: string,
    native = false,
  ) {
    const bounds = elementFrame(d, id, textFrame);
    return (
      <button
        type="button"
        key={id}
        className={`canvas-object ${native ? "native-object" : "decoration-object"} ${selected.includes(id) ? `selected${ids.length > 1 ? " member-selected" : ""}` : ""}`}
        aria-label={label}
        aria-pressed={selected.includes(id)}
        style={{
          left: bounds.x,
          top: bounds.y,
          transform: `translate(-50%,-50%) rotate(${bounds.rotation}deg)`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.detail === 0)
            onSelectionChange(selectElement(selected, id, e.shiftKey));
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          e.preventDefault();
          e.currentTarget.focus({ preventScroll: true });
          const selection = e.shiftKey
            ? selectElement(selected, id, true)
            : selected.includes(id)
              ? selected
              : [id];
          onSelectionChange(selection);
          const moving = visibleElements(d).filter((item) =>
            selection.includes(item),
          );
          if (!moving.includes(id)) return;
          onBegin?.();
          const bounds = selectionFrame(d, moving, textFrame)!;
          drag.current = {
            kind: "move",
            ids: moving,
            document: d,
            pointer: pointer(e),
            center: bounds,
            anchor: bounds,
            frame: bounds,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={updateGesture}
        onPointerUp={() => finish()}
        onPointerCancel={() => finish(true)}
        onLostPointerCapture={() => finish()}
      >
        {content}
      </button>
    );
  }
  return (
    <>
      <div
        ref={host}
        className="canvas-host"
        tabIndex={0}
        role="group"
        aria-label="Preview canvas"
        aria-keyshortcuts="Meta+A Control+A"
        onKeyDown={keyboard}
        onKeyUp={finishKeyboard}
        onBlur={finishKeyboard}
      >
        <div className="canvas-scroll" style={{ padding: canvasPadding }}>
          <div
            className="canvas-size"
            style={{
              width: d.window.width * scale,
              height: d.window.height * scale,
            }}
          >
            <CanvasRulers
              width={d.window.width}
              height={d.window.height}
              zoom={scale}
              positions={ids.map((id) => d[id])}
            />
            <div
              className="finder live-finder"
              style={{
                width: d.window.width,
                height: d.window.height,
                transform: `scale(${scale})`,
              }}
            >
              <div className="finder-title">
                <span className="traffic-lights" aria-hidden="true">
                  <HugeiconsIcon
                    icon={CircleIcon}
                    size={12}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  <HugeiconsIcon
                    icon={CircleIcon}
                    size={12}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  <HugeiconsIcon
                    icon={CircleIcon}
                    size={12}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
                <span className="finder-name">
                  <Icon icon={HardDriveIcon} size={15} />
                  {d.app.name}
                </span>
              </div>
              <div
                ref={artboard}
                className={`artboard${d.background.mode === "image" ? " image-background" : ""}`}
                style={{ height: d.window.height - TITLEBAR_HEIGHT }}
                onClick={() => onSelectionChange(["background"])}
              >
                {artwork || (
                  <div
                    className="artwork"
                    style={{
                      background: "linear-gradient(135deg,#ffefd5,#e9a26c)",
                    }}
                  />
                )}
                {item(
                  "app",
                  <>
                    <img
                      src={
                        d.app.image?.data ?? "/assets/generic-application.png"
                      }
                      alt=""
                      width={128}
                      height={128}
                      draggable={false}
                    />
                    <span className="icon-label">{d.app.name}</span>
                  </>,
                  "App icon",
                  true,
                )}
                {item(
                  "applications",
                  <>
                    <img
                      className="applications-icon"
                      src="/assets/applications-folder.png"
                      width={128}
                      height={128}
                      alt=""
                      draggable={false}
                    />
                    <span className="icon-label">Applications</span>
                  </>,
                  "Applications folder",
                  true,
                )}
                {d.text.visible &&
                  item(
                    "text",
                    <span
                      style={{
                        display: "block",
                        width: textFrame?.width ?? textBounds(d).width,
                        height: textFrame?.height ?? textBounds(d).height,
                      }}
                    />,
                    "Instruction text",
                  )}
                {d.arrow.visible &&
                  item(
                    "arrow",
                    <span
                      style={{
                        display: "block",
                        width: (d.arrow.width + 20) * d.arrow.scale,
                        height: 60 * d.arrow.scale,
                      }}
                    />,
                    "Installation arrow",
                  )}
                {frame && (
                  <SelectionHandles
                    frame={frame}
                    zoom={scale}
                    count={ids.length}
                    transformable={canTransform(ids)}
                    onBegin={beginTransform}
                    onMove={updateGesture}
                    onEnd={() => finish()}
                    onCancel={() => finish(true)}
                    onKeyTransform={(kind, amount) => {
                      onChange(
                        kind === "rotate"
                          ? rotateSelection(d, ids, frame, amount)
                          : scaleSelection(d, ids, frame, amount),
                      );
                    }}
                  />
                )}
                {guides.x !== undefined && (
                  <div className="guide guide-x" style={{ left: guides.x }} />
                )}
                {guides.y !== undefined && (
                  <div className="guide guide-y" style={{ top: guides.y }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="canvas-toolbar">
        <span>
          {d.window.width} × {d.window.height}
          <span className="toolbar-muted"> px</span>
        </span>
        <p className="preview-note">
          <Icon icon={Cursor01Icon} size={16} />
          <span aria-live="polite">
            {ids.length > 1
              ? `${ids.length} selected. Drag to move together.`
              : canTransform(ids)
                ? "Drag corners to scale. Drag outside corners to rotate."
                : "Shift-click to select more. ⌘A to select all."}
          </span>
        </p>
        <div className="zoom-controls">
          <button
            type="button"
            className="icon-button"
            aria-label="Zoom out"
            onClick={() => setZoom(Math.max(0.25, scale - 0.1))}
          >
            <Icon icon={Remove01Icon} />
          </button>
          <output>{Math.round(scale * 100)}%</output>
          <button
            type="button"
            className="icon-button"
            aria-label="Zoom in"
            onClick={() => setZoom(Math.min(2, scale + 0.1))}
          >
            <Icon icon={Add01Icon} />
          </button>
          <button
            type="button"
            className="toolbar-button"
            onClick={() => setZoom("fit")}
          >
            <Icon icon={Maximize01Icon} />
            Fit
          </button>
        </div>
      </div>
    </>
  );
}
