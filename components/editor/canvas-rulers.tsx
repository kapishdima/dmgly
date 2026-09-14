import { TITLEBAR_HEIGHT } from "@/lib/dmgly/model";

function Ruler({
  length,
  zoom,
  vertical = false,
  positions,
}: {
  length: number;
  zoom: number;
  vertical?: boolean;
  positions: number[];
}) {
  const step =
    [50, 100, 200, 500, 1000].find((value) => value * zoom >= 60) ?? 1000;
  const minor = step / 5;
  const ticks = Array.from(
    { length: Math.floor(length / minor) + 1 },
    (_, i) => i * minor,
  );
  const marks = [...new Set(positions.map(Math.round))].sort((a, b) => a - b);
  const labelGap = vertical ? 18 : 36;
  const labelMarks = marks.filter(
    (value, i) =>
      !marks
        .slice(0, i)
        .some((previous) => (value - previous) * zoom < labelGap),
  );
  const labels = [
    ...ticks.filter(
      (value) => value % step === 0 && (length - value) * zoom > labelGap,
    ),
    length,
  ];
  const size = length * zoom;

  return (
    <svg
      className={`canvas-ruler ${vertical ? "canvas-ruler-y" : "canvas-ruler-x"}`}
      width={vertical ? 34 : size}
      height={vertical ? size : 30}
      style={vertical ? { top: TITLEBAR_HEIGHT * zoom } : undefined}
      aria-hidden="true"
    >
      <line
        className="ruler-baseline"
        x1={vertical ? 30 : 0}
        y1={vertical ? 0 : 26}
        x2={vertical ? 30 : size}
        y2={vertical ? size : 26}
      />
      {[...ticks, ...(ticks.includes(length) ? [] : [length])].map((value) => {
        const at = value * zoom;
        const tick = value % step === 0 || value === length ? 8 : 4;
        return (
          <line
            key={value}
            className="ruler-tick"
            x1={vertical ? 30 - tick : at}
            y1={vertical ? at : 26 - tick}
            x2={vertical ? 30 : at}
            y2={vertical ? at : 26}
          />
        );
      })}
      {labels
        .filter(
          (value) =>
            !marks.some((mark) => Math.abs(value - mark) * zoom < labelGap),
        )
        .map((value) => (
          <text
            key={value}
            x={vertical ? 18 : value * zoom}
            y={
              vertical ? Math.min(size - 4, Math.max(9, value * zoom + 3)) : 12
            }
            textAnchor={
              vertical
                ? "end"
                : value === 0
                  ? "start"
                  : value === length
                    ? "end"
                    : "middle"
            }
          >
            {value}
          </text>
        ))}
      {marks.map((value) => (
        <line
          key={value}
          className="ruler-position"
          x1={vertical ? 24 : value * zoom}
          y1={vertical ? value * zoom : 20}
          x2={vertical ? 34 : value * zoom}
          y2={vertical ? value * zoom : 30}
        />
      ))}
      {labelMarks.map((value) => (
        <text
          key={value}
          className="ruler-position-label"
          x={vertical ? 18 : Math.min(size - 12, Math.max(12, value * zoom))}
          y={vertical ? Math.min(size - 4, Math.max(9, value * zoom + 3)) : 12}
          textAnchor={vertical ? "end" : "middle"}
        >
          {value}
        </text>
      ))}
    </svg>
  );
}

export function CanvasRulers({
  width,
  height,
  zoom,
  positions,
}: {
  width: number;
  height: number;
  zoom: number;
  positions: { x: number; y: number }[];
}) {
  return (
    <>
      <Ruler
        length={width}
        zoom={zoom}
        positions={positions.map(({ x }) => x)}
      />
      <Ruler
        length={height - TITLEBAR_HEIGHT}
        zoom={zoom}
        vertical
        positions={positions.map(({ y }) => y)}
      />
    </>
  );
}
