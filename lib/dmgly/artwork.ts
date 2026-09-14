import { Composition } from "./model";
export function escapeXml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
  );
}
export function backgroundMarkup(d: Composition): string {
  const b = d.background,
    w = d.window.width,
    h = d.window.height;
  if (b.mode === "gradient") {
    const stops = [...b.gradient.stops]
      .sort((a, b) => a.at - b.at)
      .map((s) => `<stop offset="${s.at}%" stop-color="${s.color}"/>`)
      .join("");
    const angle = (b.gradient.angle * Math.PI) / 180,
      dx = Math.sin(angle),
      dy = -Math.cos(angle),
      length = Math.abs(w * dx) + Math.abs(h * dy);
    const gradient =
      b.gradient.type === "radial"
        ? `<radialGradient id="bg" gradientUnits="userSpaceOnUse" cx="${w / 2}" cy="${h / 2}" r="${Math.hypot(w / 2, h / 2)}">${stops}</radialGradient>`
        : `<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="${w / 2 - (dx * length) / 2}" y1="${h / 2 - (dy * length) / 2}" x2="${w / 2 + (dx * length) / 2}" y2="${h / 2 + (dy * length) / 2}">${stops}</linearGradient>`;
    return `<defs>${gradient}</defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  }
  let result = `<rect width="${w}" height="${h}" fill="${b.solid}"/>`;
  if (b.mode === "image" && b.image) {
    const fit =
      b.fit === "fill"
        ? Math.max(w / b.image.width, h / b.image.height)
        : Math.min(w / b.image.width, h / b.image.height);
    const iw = b.image.width * fit * b.scale,
      ih = b.image.height * fit * b.scale;
    result += `<image href="${escapeXml(b.image.data)}" x="${(w - iw) / 2 + (b.x * w) / 100}" y="${(h - ih) / 2 + (b.y * h) / 100}" width="${iw}" height="${ih}"/>`;
  }
  return result;
}
export function backgroundSvg(d: Composition) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.window.width}" height="${d.window.height}" viewBox="0 0 ${d.window.width} ${d.window.height}">${backgroundMarkup(d)}</svg>`;
}
export function arrowPath(d: Composition) {
  const w = d.arrow.width,
    l = -w / 2,
    r = w / 2;
  if (d.arrow.shape === "chevron")
    return `M ${l} -18 L ${l + 22} 0 L ${l} 18 M ${r - 22} -18 L ${r} 0 L ${r - 22} 18`;
  if (d.arrow.shape === "curved") {
    // Align the arrowhead with the quadratic curve's tangent at its endpoint.
    const magnitude = Math.hypot(r, 30),
      tx = r / magnitude,
      ty = 30 / magnitude,
      headLength = Math.min(18, w * 0.3),
      headRadius = Math.min(12, w * 0.2),
      baseX = r - tx * headLength,
      baseY = -ty * headLength;
    return `M ${l} 15 Q 0 -30 ${r} 0 M ${baseX - ty * headRadius} ${baseY + tx * headRadius} L ${r} 0 L ${baseX + ty * headRadius} ${baseY - tx * headRadius}`;
  }
  return `M ${l} 0 L ${r} 0 M ${r - 18} -15 L ${r} 0 L ${r - 18} 15`;
}
export function textBounds(d: Composition) {
  const lines = d.text.content.split("\n");
  return {
    width: Math.min(900, Math.max(40, ...lines.map((l) => l.length * d.text.size * 0.7))),
    height: Math.max(24, lines.length * d.text.size * 1.3),
  };
}
export function decorationsMarkup(d: Composition): string {
  let result = "";
  if (d.arrow.visible)
    result += `<g transform="translate(${d.arrow.x} ${d.arrow.y}) rotate(${d.arrow.rotation})"><path d="${arrowPath(d)}" fill="none" stroke="${d.arrow.color}" stroke-width="${d.arrow.thickness}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if (d.text.visible) {
    const t = d.text,
      lines = t.content.split("\n"),
      box = textBounds(d),
      anchor = t.align === "left" ? "start" : t.align === "right" ? "end" : "middle",
      x = t.x + (t.align === "left" ? -box.width / 2 : t.align === "right" ? box.width / 2 : 0),
      font = { sans: "Arial, sans-serif", serif: "Georgia, serif", mono: "Courier New, monospace" }[
        t.font
      ];
    result += `<text font-family="${font}" font-size="${t.size}" fill="${t.color}" text-anchor="${anchor}" dominant-baseline="central" xml:space="preserve">${lines.map((line, i) => `<tspan x="${x}" y="${t.y + (i - (lines.length - 1) / 2) * t.size * 1.3}">${escapeXml(line)}</tspan>`).join("")}</text>`;
  }
  return result;
}
export function artworkSvg(d: Composition) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.window.width}" height="${d.window.height}" viewBox="0 0 ${d.window.width} ${d.window.height}">${backgroundMarkup(d)}${decorationsMarkup(d)}</svg>`;
}
