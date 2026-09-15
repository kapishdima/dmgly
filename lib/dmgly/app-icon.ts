const CORNER_RADIUS = 0.22;

export function appIconBounds(width: number, height: number, size: number) {
  const scale = Math.min(size / width, size / height);
  const w = width * scale, h = height * scale;
  return { x: (size - w) / 2, y: (size - h) / 2, width: w, height: h, radius: Math.min(w, h) * CORNER_RADIUS };
}

export function drawAppIcon(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number) {
  const bounds = appIconBounds(image.naturalWidth, image.naturalHeight, size);
  context.save();
  context.beginPath();
  context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, bounds.radius);
  context.clip();
  context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height);
  context.restore();
}
