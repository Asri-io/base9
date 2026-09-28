"use client";

import { useEffect, useRef, useCallback } from "react";

interface MockupCanvasProps {
  garmentImageSrc: string;  // photo of the blank garment
  designSrc: string;        // the design/print to composite
  garmentType: "tshirt" | "jacket";
  garmentColor: string;
  className?: string;
}

// Print area coordinates as % of canvas — these define where the
// design sits on the garment photo, with perspective corner points
// Format: [topLeft, topRight, bottomRight, bottomLeft] as [x%, y%]
const PRINT_ZONES: Record<string, [number, number][]> = {
  tshirt: [
    [33, 22],   // top-left of chest print area
    [67, 22],   // top-right
    [67, 55],   // bottom-right
    [33, 55],   // bottom-left
  ],
  jacket: [
    [30, 18],
    [70, 18],
    [70, 58],
    [30, 58],
  ],
};

// Colour tint overlay to make design look printed on fabric
// (slightly reduces opacity + blends with garment colour)
const COLOR_BLEND: Record<string, { opacity: number; blend: string }> = {
  Black:    { opacity: 0.92, blend: "multiply" },
  White:    { opacity: 0.88, blend: "multiply" },
  Gray:     { opacity: 0.85, blend: "multiply" },
  Navy:     { opacity: 0.90, blend: "multiply" },
  Cream:    { opacity: 0.86, blend: "multiply" },
  Olive:    { opacity: 0.88, blend: "multiply" },
  Red:      { opacity: 0.90, blend: "multiply" },
  Burgundy: { opacity: 0.91, blend: "multiply" },
};

/**
 * Applies a perspective transform (homography) to map the design
 * onto the 4 corner points of the print zone — gives the natural
 * "printed on fabric" effect without any 3D library.
 */
function applyPerspective(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dst: [number, number][], // 4 destination points in canvas pixels
  opacity: number,
  blendMode: string
) {
  const [tl, tr, br, bl] = dst;

  // We draw the image sliced into a grid and warp each cell
  // This gives a smoother perspective than a single quad
  const SLICES = 20;
  ctx.save();
  ctx.globalAlpha       = opacity;
  ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

  for (let row = 0; row < SLICES; row++) {
    for (let col = 0; col < SLICES; col++) {
      const r0 = row / SLICES,       r1 = (row + 1) / SLICES;
      const c0 = col / SLICES,       c1 = (col + 1) / SLICES;

      // Bilinear interpolation of the 4 corners to find quad vertices
      const lerp = (a: [number,number], b: [number,number], t: number): [number,number] =>
        [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t];

      const top0  = lerp(tl, tr, c0);
      const top1  = lerp(tl, tr, c1);
      const bot0  = lerp(bl, br, c0);
      const bot1  = lerp(bl, br, c1);

      const p00 = lerp(top0, bot0, r0);
      const p10 = lerp(top1, bot1, r0);
      const p01 = lerp(top0, bot0, r1);
      const p11 = lerp(top1, bot1, r1);

      // Source rectangle in design image
      const sx = c0 * img.width,   sw = (c1 - c0) * img.width;
      const sy = r0 * img.height,  sh = (r1 - r0) * img.height;

      // Draw the cell with a path clip
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00[0], p00[1]);
      ctx.lineTo(p10[0], p10[1]);
      ctx.lineTo(p11[0], p11[1]);
      ctx.lineTo(p01[0], p01[1]);
      ctx.closePath();
      ctx.clip();

      // Transform to map source rect to destination quad
      // Using canvas transform — approximate but visually convincing at this cell size
      const dx = p00[0], dy = p00[1];
      const dw = Math.hypot(p10[0]-p00[0], p10[1]-p00[1]);
      const dh = Math.hypot(p01[0]-p00[0], p01[1]-p00[1]);
      const angle = Math.atan2(p10[1]-p00[1], p10[0]-p00[0]);

      ctx.translate(dx, dy);
      ctx.rotate(angle);
      ctx.scale(dw / sw || 0.001, dh / sh || 0.001);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      ctx.restore();
    }
  }

  ctx.restore();
}

export default function MockupCanvas({
  garmentImageSrc,
  designSrc,
  garmentType,
  garmentColor,
  className = "",
}: MockupCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const garmentImg = new Image();
    garmentImg.crossOrigin = "anonymous";
    garmentImg.src = garmentImageSrc;

    garmentImg.onload = () => {
      const W = garmentImg.naturalWidth;
      const H = garmentImg.naturalHeight;
      canvas.width  = W;
      canvas.height = H;

      // Draw base garment
      ctx.drawImage(garmentImg, 0, 0, W, H);

      // If no design, stop here
      if (!designSrc) return;

      const designImg = new Image();
      designImg.crossOrigin = "anonymous";
      designImg.src = designSrc;

      designImg.onload = () => {
        const zone  = PRINT_ZONES[garmentType] ?? PRINT_ZONES.tshirt;
        const blend = COLOR_BLEND[garmentColor] ?? { opacity: 0.88, blend: "multiply" };

        // Convert % coordinates to canvas pixels
        const dst: [number, number][] = zone.map(([px, py]) => [
          (px / 100) * W,
          (py / 100) * H,
        ]);

        applyPerspective(ctx, designImg, dst, blend.opacity, blend.blend);

        // Subtle fabric texture overlay — noise pass to break up flatness
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.globalCompositeOperation = "overlay";
        for (let i = 0; i < 3000; i++) {
          const x   = Math.random() * W;
          const y   = Math.random() * H;
          const lum = Math.random() > 0.5 ? 255 : 0;
          ctx.fillStyle = `rgba(${lum},${lum},${lum},0.3)`;
          ctx.fillRect(x, y, 1, 1);
        }
        ctx.restore();
      };
    };
  }, [garmentImageSrc, designSrc, garmentType, garmentColor]);

  useEffect(() => { render(); }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-contain ${className}`}
      style={{ imageRendering: "auto" }}
    />
  );
}
