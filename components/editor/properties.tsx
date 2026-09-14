"use client";
import { useEffect, useRef } from "react";
import {
  Image01Icon,
  PackageIcon,
  Folder01Icon,
  TextIcon,
  ArrowRight01Icon,
  Add01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { ColorControl, SelectControl, Slider, Toggle, TextControl } from "dialkit";
import "dialkit/styles.css";
import { AssetUpload } from "./asset-upload";
import {
  Composition,
  ElementId,
  moveElement,
  resizeWindow,
  TITLEBAR_HEIGHT,
} from "@/lib/dmgly/model";

export function hexColor(value: string): string {
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
export function BackgroundProperties({
  document: d,
  onChange,
}: {
  document: Composition;
  onChange: (d: Composition) => void;
}) {
  const b = d.background;
  const update = (patch: Partial<typeof b>) => onChange({ ...d, background: { ...b, ...patch } });
  return (
    <div className="dialkit-root control-stack" data-theme="light">
      <div className="segment">
        {(["solid", "gradient", "image"] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            aria-pressed={b.mode === mode}
            className={b.mode === mode ? "active" : ""}
            onClick={() => update({ mode })}
          >
            {mode[0].toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
      {b.mode === "solid" && (
        <ColorControl
          label="Color"
          value={b.solid}
          onChange={(value) => update({ solid: hexColor(value) })}
        />
      )}
      {b.mode === "image" && (
        <>
          <AssetUpload
            label="Upload background"
            value={b.image}
            onChange={(image) => update({ image })}
          />
          <SelectControl
            label="Sizing"
            value={b.fit}
            options={[
              { value: "fill", label: "Fill" },
              { value: "fit", label: "Fit" },
            ]}
            onChange={(fit) => update({ fit: fit as "fill" | "fit" })}
          />
          <Slider
            label="Scale"
            value={b.scale}
            min={0.25}
            max={4}
            step={0.01}
            onChange={(scale) => update({ scale })}
          />
          <Slider
            label="Offset X"
            value={b.x}
            min={-100}
            max={100}
            step={1}
            unit="%"
            onChange={(x) => update({ x })}
          />
          <Slider
            label="Offset Y"
            value={b.y}
            min={-100}
            max={100}
            step={1}
            unit="%"
            onChange={(y) => update({ y })}
          />
          <ColorControl
            label="Fill color"
            value={b.solid}
            onChange={(value) => update({ solid: hexColor(value) })}
          />
        </>
      )}
      {b.mode === "gradient" && (
        <>
          <SelectControl
            label="Type"
            value={b.gradient.type}
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
            ]}
            onChange={(type) =>
              update({ gradient: { ...b.gradient, type: type as "linear" | "radial" } })
            }
          />
          {b.gradient.type === "linear" && (
            <Slider
              label="Angle"
              value={b.gradient.angle}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={(angle) => update({ gradient: { ...b.gradient, angle } })}
            />
          )}
          <p className="field-label">Color stops</p>
          {b.gradient.stops.map((stop, i) => (
            <div className="color-stop" key={stop.id}>
              <ColorControl
                label={`Color ${i + 1}`}
                value={stop.color}
                onChange={(color) =>
                  update({
                    gradient: {
                      ...b.gradient,
                      stops: b.gradient.stops.map((s) =>
                        s.id === stop.id ? { ...s, color: hexColor(color) } : s,
                      ),
                    },
                  })
                }
              />
              <div className="stop-position">
                <Slider
                  label="Position"
                  value={stop.at}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={(at) =>
                    update({
                      gradient: {
                        ...b.gradient,
                        stops: b.gradient.stops.map((s) => (s.id === stop.id ? { ...s, at } : s)),
                      },
                    })
                  }
                />
                <button
                  type="button"
                  className="small-button"
                  aria-label={`Remove color ${i + 1}`}
                  disabled={b.gradient.stops.length <= 2}
                  onClick={() =>
                    update({
                      gradient: {
                        ...b.gradient,
                        stops: b.gradient.stops.filter((s) => s.id !== stop.id),
                      },
                    })
                  }
                >
                  <Icon icon={Cancel01Icon} size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="secondary-button"
            disabled={b.gradient.stops.length >= 8}
            onClick={() =>
              update({
                gradient: {
                  ...b.gradient,
                  stops: [
                    ...b.gradient.stops,
                    { id: crypto.randomUUID(), color: "#ffffff", at: 50 },
                  ],
                },
              })
            }
          >
            <Icon icon={Add01Icon} size={16} />
            Add color stop
          </button>
        </>
      )}
    </div>
  );
}

export function DecorationProperties({
  document: d,
  id,
  onChange,
}: {
  document: Composition;
  id: "text" | "arrow";
  onChange: (d: Composition) => void;
}) {
  const t = d.text,
    a = d.arrow;
  return (
    <div className="dialkit-root control-stack" data-theme="light">
      <Toggle
        label="Visible"
        checked={d[id].visible}
        onChange={(visible) => onChange({ ...d, [id]: { ...d[id], visible } })}
      />
      {id === "text" ? (
        <>
          <TextControl
            label="Text"
            value={t.content}
            onChange={(content) =>
              onChange({ ...d, text: { ...t, content: content.slice(0, 500) } })
            }
          />
          <SelectControl
            label="Font"
            value={t.font}
            options={[
              { value: "sans", label: "Sans serif" },
              { value: "serif", label: "Serif" },
              { value: "mono", label: "Monospace" },
            ]}
            onChange={(font) => onChange({ ...d, text: { ...t, font: font as typeof t.font } })}
          />
          <Slider
            label="Size"
            min={12}
            max={64}
            step={1}
            value={t.size}
            onChange={(size) => onChange({ ...d, text: { ...t, size } })}
          />
          <ColorControl
            label="Color"
            value={t.color}
            onChange={(value) => onChange({ ...d, text: { ...t, color: hexColor(value) } })}
          />
          <SelectControl
            label="Align"
            value={t.align}
            options={["left", "center", "right"]}
            onChange={(align) => onChange({ ...d, text: { ...t, align: align as typeof t.align } })}
          />
        </>
      ) : (
        <>
          <SelectControl
            label="Shape"
            value={a.shape}
            options={["straight", "curved", "chevron"]}
            onChange={(shape) =>
              onChange({ ...d, arrow: { ...a, shape: shape as typeof a.shape } })
            }
          />
          <ColorControl
            label="Color"
            value={a.color}
            onChange={(value) => onChange({ ...d, arrow: { ...a, color: hexColor(value) } })}
          />
          <Slider
            label="Width"
            value={a.width}
            min={32}
            max={240}
            step={1}
            onChange={(width) => onChange({ ...d, arrow: { ...a, width } })}
          />
          <Slider
            label="Thickness"
            value={a.thickness}
            min={2}
            max={14}
            step={1}
            onChange={(thickness) => onChange({ ...d, arrow: { ...a, thickness } })}
          />
          <Slider
            label="Rotation"
            value={a.rotation}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(rotation) => onChange({ ...d, arrow: { ...a, rotation } })}
          />
        </>
      )}
    </div>
  );
}

export function Inspector({
  document: d,
  selected,
  onSelect,
  onChange,
  onBegin,
  onEnd,
  children,
}: {
  document: Composition;
  selected: ElementId;
  onSelect: (id: ElementId) => void;
  onChange: (d: Composition) => void;
  onBegin?: () => void;
  onEnd?: () => void;
  children?: React.ReactNode;
}) {
  const labels = {
    background: "Background",
    app: "App",
    applications: "Folder",
    text: "Text",
    arrow: "Arrow",
  };
  const native = selected === "app" || selected === "applications";
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0 });
  }, [selected]);
  const icons = {
    background: Image01Icon,
    app: PackageIcon,
    applications: Folder01Icon,
    text: TextIcon,
    arrow: ArrowRight01Icon,
  };
  return (
    <aside
      className="inspector"
      onPointerDownCapture={onBegin}
      onPointerUpCapture={(e) => {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))
          onEnd?.();
      }}
      onPointerCancelCapture={onEnd}
      onFocusCapture={onBegin}
      onBlurCapture={onEnd}
    >
      <div className="inspector-heading">
        <h2>Design</h2>
        <p>Every detail, in its place.</p>
      </div>
      <div className="element-tabs" aria-label="Select element">
        {(Object.keys(labels) as ElementId[]).map((id) => (
          <button
            type="button"
            key={id}
            className={selected === id ? "active" : ""}
            aria-pressed={selected === id}
            onClick={() => onSelect(id)}
          >
            <Icon icon={icons[id]} />
            <span>{labels[id]}</span>
          </button>
        ))}
      </div>
      <div ref={scroll} className="property-scroll">
        {selected === "background" && <BackgroundProperties document={d} onChange={onChange} />}
        {selected === "app" && (
          <div className="dialkit-root control-stack" data-theme="light">
            <TextControl
              label="App name"
              value={d.app.name}
              onChange={(name) => onChange({ ...d, app: { ...d.app, name: name.slice(0, 80) } })}
            />
            <AssetUpload
              label="Upload app icon"
              value={d.app.image}
              onChange={(image) => onChange({ ...d, app: { ...d.app, image } })}
            />
            <p className="control-note">Use the same icon as your built app.</p>
          </div>
        )}
        {(selected === "text" || selected === "arrow") && (
          <DecorationProperties document={d} id={selected} onChange={onChange} />
        )}
        {selected !== "background" && (
          <div className="dialkit-root control-stack position-controls" data-theme="light">
            <p className="field-label">Position</p>
            <Slider
              label="X"
              value={d[selected].x}
              min={native ? 72 : 16}
              max={d.window.width - (native ? 72 : 16)}
              step={1}
              onChange={(x) => onChange(moveElement(d, selected, x, d[selected].y))}
            />
            <Slider
              label="Y"
              value={d[selected].y}
              min={native ? 72 : 16}
              max={d.window.height - TITLEBAR_HEIGHT - (native ? 96 : 16)}
              step={1}
              onChange={(y) => onChange(moveElement(d, selected, d[selected].x, y))}
            />
            {native && <p className="control-note">Native icon size is 128 px.</p>}
          </div>
        )}
      </div>
      <details className="window-details">
        <summary>
          Window size{" "}
          <span>
            {d.window.width} × {d.window.height}
          </span>
          <Icon icon={ArrowDown01Icon} size={16} />
        </summary>
        <div className="dialkit-root control-stack" data-theme="light">
          <Slider
            label="Width"
            value={d.window.width}
            min={480}
            max={1200}
            step={1}
            onChange={(width) => onChange(resizeWindow(d, width, d.window.height))}
          />
          <Slider
            label="Height"
            value={d.window.height}
            min={320}
            max={900}
            step={1}
            onChange={(height) => onChange(resizeWindow(d, d.window.width, height))}
          />
        </div>
      </details>
      {children}
    </aside>
  );
}
