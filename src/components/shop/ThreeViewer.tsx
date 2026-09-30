"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
  modelUrl?:  string; // path to GLB — defaults to the jacket
}

const THREE_CDN   = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const GLTF_CDN    = "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js";
const DEFAULT_GLB = "/models/jacket.glb";

export default function ThreeViewer({
  frontImage,
  backImage,
  modelUrl = DEFAULT_GLB,
}: ThreeViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress]   = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    // Load Three.js then GLTFLoader sequentially
    const loadScript = (src: string): Promise<void> =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src; s.async = true;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        await loadScript(THREE_CDN);
        await loadScript(GLTF_CDN);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE    = (window as any).THREE;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const GLTFLoader = (window as any).THREE.GLTFLoader;

        if (!THREE || !GLTFLoader || !mount) return;

        const W = mount.clientWidth  || 400;
        const H = mount.clientHeight || 500;

        // ── Renderer ──
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding      = THREE.sRGBEncoding;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        renderer.shadowMap.enabled   = true;
        renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);

        // ── Scene ──
        const scene = new THREE.Scene();

        // ── Camera ──
        const camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 100);
        camera.position.set(0, 0.1, 3.0);

        // ── Lighting — 3-point setup ──
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));

        const key = new THREE.DirectionalLight(0xfff8f0, 2.0);
        key.position.set(-1.5, 2.5, 2.5);
        key.castShadow = true;
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xe8f0ff, 0.7);
        fill.position.set(2.5, 0, 1.5);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0xffffff, 0.9);
        rim.position.set(0, -1.5, -2.5);
        scene.add(rim);

        // ── Load the product texture (design/image) ──
        const texLoader = new THREE.TextureLoader();
        const frontTex  = texLoader.load(frontImage);
        const backTex   = texLoader.load(backImage || frontImage);
        frontTex.encoding = THREE.sRGBEncoding;
        backTex.encoding  = THREE.sRGBEncoding;
        frontTex.flipY    = false; // GLB UVs don't need flip
        backTex.flipY     = false;

        // ── Load the GLB jacket model ──
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          // onLoad
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (gltf: any) => {
            const model = gltf.scene;

            // Centre and scale the model to fit nicely in view
            const box    = new THREE.Box3().setFromObject(model);
            const centre = new THREE.Vector3();
            box.getCenter(centre);
            const size   = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale  = 2.2 / maxDim;

            model.position.sub(centre);       // centre at origin
            model.scale.setScalar(scale);     // normalise size

            // Apply product image as texture to all mesh materials
            model.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow    = true;
                child.receiveShadow = true;

                // Clone the material so we don't mutate the original
                if (Array.isArray(child.material)) {
                  child.material = child.material.map((m: any) => {
                    const mat  = m.clone();
                    mat.map    = frontTex;
                    mat.roughness = 0.82;
                    mat.metalness = 0.0;
                    mat.needsUpdate = true;
                    return mat;
                  });
                } else {
                  const mat    = child.material.clone();
                  mat.map      = frontTex;
                  mat.roughness = 0.82;
                  mat.metalness = 0.0;
                  mat.needsUpdate = true;
                  child.material = mat;
                }
              }
            });

            scene.add(model);
            setLoadState("ready");

            // ── Interaction ──
            let isDragging = false;
            let prevX = 0, prevY = 0;
            let targetRotY = 0, targetRotX = 0;
            let currentRotY = 0, currentRotX = 0;
            let velY = 0;
            let autoRotate = true;

            const startDrag = (x: number, y: number) => { isDragging = true; autoRotate = false; velY = 0; prevX = x; prevY = y; };
            const moveDrag  = (x: number, y: number) => {
              if (!isDragging) return;
              velY = (x - prevX) * 0.012;
              targetRotY += velY;
              targetRotX += (y - prevY) * 0.006;
              targetRotX  = Math.max(-0.5, Math.min(0.5, targetRotX));
              prevX = x; prevY = y;
            };
            const endDrag   = () => { isDragging = false; };

            renderer.domElement.addEventListener("mousedown",  (e: MouseEvent) => startDrag(e.clientX, e.clientY));
            window.addEventListener("mousemove",  (e: MouseEvent) => moveDrag(e.clientX, e.clientY));
            window.addEventListener("mouseup",    endDrag);
            renderer.domElement.addEventListener("touchstart", (e: TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchmove",  (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchend",   endDrag);

            // ── Animate ──
            let frameId: number;
            const clock = new THREE.Clock();

            const animate = () => {
              frameId = requestAnimationFrame(animate);
              const t = clock.getElapsedTime();

              if (autoRotate) {
                targetRotY += 0.003;
              } else if (!isDragging) {
                velY       *= 0.90;
                targetRotY += velY;
                targetRotX *= 0.92;
              }

              currentRotY += (targetRotY - currentRotY) * 0.07;
              currentRotX += (targetRotX - currentRotX) * 0.07;

              model.rotation.y = currentRotY;
              model.rotation.x = currentRotX;
              model.position.y = Math.sin(t * 0.7) * 0.025; // gentle float

              renderer.render(scene, camera);
            };
            animate();

            cleanupRef.current = () => {
              cancelAnimationFrame(frameId);
              renderer.dispose();
              if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
          },
          // onProgress
          (xhr: { loaded: number; total: number }) => {
            if (xhr.total) setProgress(Math.round((xhr.loaded / xhr.total) * 100));
          },
          // onError
          (err: unknown) => {
            console.error("GLB load error:", err);
            setLoadState("error");
          }
        );
      } catch (err) {
        console.error("ThreeViewer init error:", err);
        setLoadState("error");
      }
    };

    init();

    return () => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    };
  }, [frontImage, backImage, modelUrl]);

  return (
    <div className="w-full h-full relative bg-transparent">
      {/* Loading state */}
      {loadState === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none">
          <div className="w-8 h-8 border-2 border-base9-red border-t-transparent rounded-full animate-spin" />
          {progress > 0 && (
            <div className="w-32 bg-base9-gray-800 h-0.5 overflow-hidden">
              <div className="h-full bg-base9-red transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="text-[10px] tracking-widest uppercase text-base9-gray-600">
            {progress > 0 ? `Loading ${progress}%` : "Loading model..."}
          </p>
        </div>
      )}

      {/* Error state — fall back gracefully */}
      {loadState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <p className="text-[10px] tracking-widest uppercase text-base9-gray-700">
            3D unavailable
          </p>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full" />

      {loadState === "ready" && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-base9-gray-700 uppercase pointer-events-none select-none">
          Drag to rotate
        </p>
      )}
    </div>
  );
}
