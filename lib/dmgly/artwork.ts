import { Composition } from "./model";
export function escapeXml(s: string) { return s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[c]!)); }
export function backgroundMarkup(d: Composition): string {
  const b=d.background,w=d.window.width,h=d.window.height;
  if(b.mode === "gradient") {
    const stops=[...b.gradient.stops].sort((a,b)=>a.at-b.at).map(s=>`<stop offset="${s.at}%" stop-color="${s.color}"/>`).join("");
    const angle=b.gradient.angle*Math.PI/180, dx=Math.sin(angle),dy=-Math.cos(angle), length=Math.abs(w*dx)+Math.abs(h*dy);
    const gradient=b.gradient.type === "radial" ? `<radialGradient id="bg" gradientUnits="userSpaceOnUse" cx="${w/2}" cy="${h/2}" r="${Math.hypot(w/2,h/2)}">${stops}</radialGradient>` : `<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="${w/2-dx*length/2}" y1="${h/2-dy*length/2}" x2="${w/2+dx*length/2}" y2="${h/2+dy*length/2}">${stops}</linearGradient>`;
    return `<defs>${gradient}</defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  }
  let result = `<rect width="${w}" height="${h}" fill="${b.solid}"/>`;
  if (b.mode === "image" && b.image) {
    const fit = b.fit === "fill" ? Math.max(w/b.image.width,h/b.image.height) : Math.min(w/b.image.width,h/b.image.height);
    const iw=b.image.width*fit*b.scale,ih=b.image.height*fit*b.scale;
    result += `<image href="${escapeXml(b.image.data)}" x="${(w-iw)/2+b.x*w/100}" y="${(h-ih)/2+b.y*h/100}" width="${iw}" height="${ih}"/>`;
  }
  return result;
}
export function backgroundSvg(d: Composition) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.window.width}" height="${d.window.height}" viewBox="0 0 ${d.window.width} ${d.window.height}">${backgroundMarkup(d)}</svg>`; }
