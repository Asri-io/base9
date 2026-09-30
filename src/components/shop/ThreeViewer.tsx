"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;  // product photo / design image from admin
  backImage:  string;
  modelUrl?:  string;
}

// UV coordinates for the print zones on this specific jacket model's 2048×2048 texture
// These were determined by analysing the UV layout of the jacket_base_texture.jpg
// Format: { x, y, w, h } as fractions of the texture (0–1)
const PRINT_ZONE_FRONT = { x: 0.28, y: 0.10, w: 0.44, h: 0.52 };
const PRINT_ZONE_BACK  = { x: 0.28, y: 0.10, w: 0.44, h: 0.52 };

const TEX_SIZE = 2048; // jacket texture is 2048×2048

/**
 * Creates a composite texture: jacket base + design overlaid at the print zone.
 * Returns a data URL for the new texture.
 */
async function buildCompositeTexture(
  baseTextureUrl: string,
  designUrl: string,
  zone: typeof PRINT_ZONE_FRONT
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width  = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx = canvas.getContext("2d")!;

    // Load base jacket texture
    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = baseTextureUrl;
    baseImg.onload = () => {
      // Draw the jacket's original UV texture as base
      ctx.drawImage(baseImg, 0, 0, TEX_SIZE, TEX_SIZE);

      // Load the design image
      const designImg = new Image();
      designImg.crossOrigin = "anonymous";
      designImg.src = designUrl;
      designImg.onload = () => {
        const px = zone.x * TEX_SIZE;
        const py = zone.y * TEX_SIZE;
        const pw = zone.w * TEX_SIZE;
        const ph = zone.h * TEX_SIZE;

        // Blend the design onto the jacket texture
        // multiply blend makes it look printed on fabric
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.92;
        ctx.drawImage(designImg, px, py, pw, ph);
        ctx.restore();

        // Slight overlay to integrate the design with fabric texture
        ctx.save();
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.08;
        ctx.drawImage(designImg, px, py, pw, ph);
        ctx.restore();

        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      designImg.onerror = () => {
        // If design fails to load, just use the base texture
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
    };
    baseImg.onerror = reject;
  });
}

export default function ThreeViewer({
  frontImage,
  backImage,
  modelUrl = "/models/jacket.glb",
}: ThreeViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [state,    setState]    = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Loading 3D model...");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const init = async () => {
      try {
        setStatusMsg("Loading 3D engine...");
        const THREE          = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader");

        const W = mount.clientWidth  || 400;
        const H = mount.clientHeight || 500;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding      = THREE.sRGBEncoding;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.shadowMap.enabled   = true;
        mount.appendChild(renderer.domElement);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, W / H, 0.001, 1000);

        // Studio lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        const lightConfigs: [number,number,number,number][] = [
          [ 0,  4,  5, 2.0],  // key
          [-3,  2,  2, 1.2],  // fill left
          [ 3,  1,  2, 0.8],  // fill right
          [ 0, -2, -3, 0.5],  // rim bottom
          [ 0,  3, -4, 0.7],  // rim back
        ];
        lightConfigs.forEach(([x, y, z, i]) => {
          const l = new THREE.DirectionalLight(0xffffff, i);
          l.position.set(x, y, z);
          l.castShadow = true;
          scene.add(l);
        });

        setStatusMsg("Loading jacket model...");
        const loader = new GLTFLoader();

        loader.load(
          modelUrl,
          async (gltf) => {
            const model = gltf.scene;

            // ── Centre model at world origin ──
            const box    = new THREE.Box3().setFromObject(model);
            const size   = box.getSize(new THREE.Vector3());
            const centre = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 2.0 / maxDim;

            model.scale.setScalar(scale);
            model.position.set(
              -centre.x * scale,
              -centre.y * scale,
              -centre.z * scale
            );

            // Camera
            const scaledSize = size.clone().multiplyScalar(scale);
            const fovRad     = THREE.MathUtils.degToRad(35);
            const camDist    = (Math.max(scaledSize.x, scaledSize.y) / 2) / Math.tan(fovRad / 2);
            camera.position.set(0, 0, camDist * 1.4);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();

            // ── Build composite texture (design on jacket UV) ──
            if (frontImage) {
              setStatusMsg("Applying design to model...");
              try {
                // Get the base jacket texture from the GLB's embedded texture
                // We serve it as a static asset for cross-origin compositing
                const baseUrl = "/models/jacket_base_texture.jpg";
                const compositeDataUrl = await buildCompositeTexture(
                  baseUrl,
                  frontImage,
                  PRINT_ZONE_FRONT
                );

                // Create Three.js texture from the composited canvas
                const newTex = new THREE.TextureLoader().load(compositeDataUrl);
                newTex.encoding = THREE.sRGBEncoding;
                newTex.flipY    = false;

                // Apply to all meshes on the model
                model.traverse((child) => {
                  if (!(child as THREE.Mesh).isMesh) return;
                  const mesh = child as THREE.Mesh;
                  mesh.castShadow    = true;
                  mesh.receiveShadow = true;

                  const applyTex = (mat: THREE.Material) => {
                    const m = (mat as THREE.MeshStandardMaterial).clone() as THREE.MeshStandardMaterial;
                    m.map         = newTex;
                    m.needsUpdate = true;
                    return m;
                  };

                  mesh.material = Array.isArray(mesh.material)
                    ? mesh.material.map(applyTex)
                    : applyTex(mesh.material as THREE.Material);
                });
              } catch (texErr) {
                console.warn("Texture composite failed, using original:", texErr);
                // Fall through — model will use its original embedded textures
                model.traverse((child) => {
                  if ((child as THREE.Mesh).isMesh) {
                    (child as THREE.Mesh).castShadow    = true;
                    (child as THREE.Mesh).receiveShadow = true;
                  }
                });
              }
            } else {
              // No design — just enable shadows on original model
              model.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                  (child as THREE.Mesh).castShadow    = true;
                  (child as THREE.Mesh).receiveShadow = true;
                }
              });
            }

            scene.add(model);
            setState("ready");

            // Interaction
            let isDragging = false, prevX = 0, prevY = 0, velY = 0;
            let targetY = 0, targetX = 0, currY = 0, currX = 0, auto = true;

            const down = (x: number, y: number) => { isDragging = true; auto = false; velY = 0; prevX = x; prevY = y; };
            const move = (x: number, y: number) => {
              if (!isDragging) return;
              velY    = (x - prevX) * 0.012;
              targetY += velY;
              targetX  = Math.max(-0.4, Math.min(0.4, targetX + (y - prevY) * 0.006));
              prevX = x; prevY = y;
            };
            const up = () => { isDragging = false; };

            renderer.domElement.addEventListener("mousedown",  (e: MouseEvent) => down(e.clientX, e.clientY));
            window.addEventListener("mousemove",               (e: MouseEvent) => move(e.clientX, e.clientY));
            window.addEventListener("mouseup",                 up);
            renderer.domElement.addEventListener("touchstart", (e: TouchEvent) => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchmove",               (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchend",                up);

            let frameId: number;
            const clock    = new THREE.Clock();
            const centreY  = centre.y * scale; // for float animation

            const tick = () => {
              frameId = requestAnimationFrame(tick);
              const t = clock.getElapsedTime();
              if (auto)             { targetY += 0.003; }
              else if (!isDragging) { velY *= 0.90; targetY += velY; targetX *= 0.92; }
              currY += (targetY - currY) * 0.07;
              currX += (targetX - currX) * 0.07;
              model.rotation.y = currY;
              model.rotation.x = currX;
              model.position.y = -centreY + Math.sin(t * 0.7) * 0.04;
              renderer.render(scene, camera);
            };
            tick();

            cleanupRef.current = () => {
              cancelAnimationFrame(frameId);
              renderer.domElement.removeEventListener("mousedown",  (e: MouseEvent) => down(e.clientX, e.clientY));
              window.removeEventListener("mousemove",               (e: MouseEvent) => move(e.clientX, e.clientY));
              window.removeEventListener("mouseup",                 up);
              renderer.domElement.removeEventListener("touchstart", (e: TouchEvent) => down(e.touches[0].clientX, e.touches[0].clientY));
              window.removeEventListener("touchmove",               (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY));
              window.removeEventListener("touchend",                up);
              renderer.dispose();
              if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
          },
          (xhr) => {
            if (xhr.total) {
              const p = Math.round(xhr.loaded / xhr.total * 100);
              setProgress(p);
              setStatusMsg(`Loading model ${p}%...`);
            }
          },
          (err) => { console.error("GLB:", err); setState("error"); }
        );
      } catch (e) {
        console.error("ThreeViewer:", e);
        setState("error");
      }
    };

    init();
    return () => { if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; } };
  }, [frontImage, backImage, modelUrl]);

  return (
    <div className="w-full h-full relative bg-transparent">
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none z-10">
          <div className="w-7 h-7 border-2 border-base9-red border-t-transparent rounded-full animate-spin" />
          {progress > 0 && (
            <div className="w-32 bg-base9-gray-800 h-0.5">
              <div className="h-full bg-base9-red transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="text-[9px] tracking-widest uppercase text-base9-gray-600 text-center max-w-[120px]">
            {statusMsg}
          </p>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p className="text-[9px] tracking-widest uppercase text-base9-gray-700">3D unavailable</p>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
      {state === "ready" && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-widest uppercase text-base9-gray-700 pointer-events-none select-none">
          Drag to rotate
        </p>
      )}
    </div>
  );
}
