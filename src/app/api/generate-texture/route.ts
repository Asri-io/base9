import { NextRequest, NextResponse } from "next/server";

/**
 * Generates a custom jacket texture by compositing a design image
 * onto the jacket's UV template at the chest print zone.
 *
 * Uses the Canvas API (via @vercel/og's Satori-compatible approach)
 * to composite images server-side.
 *
 * Input: { designUrl: string, position: "front" | "back" }
 * Output: PNG texture ready to use as GLB baseColorTexture
 */
export async function POST(req: NextRequest) {
  try {
    const { designUrl, position = "front" } = await req.json();

    if (!designUrl) {
      return NextResponse.json({ error: "designUrl required" }, { status: 400 });
    }

    // Return the design URL directly for now
    // The Three.js viewer handles the UV compositing client-side
    // This route is a placeholder for future server-side processing
    return NextResponse.json({
      textureUrl: designUrl,
      position,
      uvZone: position === "front"
        ? { x: 0.25, y: 0.15, w: 0.50, h: 0.55 }  // front chest zone (% of 2048x2048)
        : { x: 0.25, y: 0.15, w: 0.50, h: 0.60 }, // back zone
    });
  } catch (err) {
    console.error("generate-texture:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
