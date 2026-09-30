"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
  modelUrl?:  string;
}

const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const GLTF_CDN  = "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js";

export default function ThreeViewer({
  frontImage,
  backImage,
  modelUrl = "/models/jacket.glb",
}: ThreeViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [state,    setState]    = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const loadScript = (src: string): Promise<void> =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = Object.assign(document.createElement("script"), { src, async: true });
        s.onload = () => res();
        s.onerror = () => rej();
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        await loadScript(THREE_CDN);
        await loadScript(GLTF_CDN);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE      = (window as any).THREE;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const GLTFLoader = THREE?.GLTFLoader;
        if (!THREE || !GLTFLoader || !mount) return;

        const W = mount.clientWidth  || 400;
        const H = mount.clientHeight || 500;

        // ── Renderer ──
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding      = THREE.sRGBEncoding;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled   = true;
        mount.appendChild(renderer.domElement);

        // ── Scene ──
        const scene = new THREE.Scene();

        // ── Camera — will be repositioned after model loads ──
        const camera = new THREE.PerspectiveCamera(35, W / H, 0.001, 1000);
        camera.position.set(0, 0, 5);

        // ── Lights — multiple strong lights to ensure visibility ──
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));

        const lights = [
          { pos: [0, 5, 5],   color: 0xffffff, intensity: 2.0 },
          { pos: [-5, 3, 3],  color: 0xfff5e0, intensity: 1.5 },
          { pos: [5, 0, 3],   color: 0xe8f0ff, intensity: 1.0 },
          { pos: [0, -3, -5], color: 0xffffff, intensity: 0.8 },
        ];
        lights.forEach(({ pos, color, intensity }) => {
          const l = new THREE.DirectionalLight(color, intensity);
          l.position.set(...pos as [number,number,number]);
          scene.add(l);
        });

        // ── Load textures ──
        const texLoader = new THREE.TextureLoader();
        const frontTex  = texLoader.load(frontImage);
        const backTex   = texLoader.load(backImage || frontImage);
        [frontTex, backTex].forEach((t: any) => { t.encoding = THREE.sRGBEncoding; t.flipY = false; });

        // ── Load GLB ──
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (gltf: any) => {
            const model = gltf.scene;

            // ── Auto-fit: centre and scale to fill view ──
            const box    = new THREE.Box3().setFromObject(model);
            const centre = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Normalise to unit size, then scale to desired display size
            const targetSize = 2.0;
            const scale      = targetSize / maxDim;
            model.scale.setScalar(scale);

            // Re-centre after scaling
            const box2   = new THREE.Box3().setFromObject(model);
            const centre2 = box2.getCenter(new THREE.Vector3());
            model.position.sub(centre2);

            // Reposition camera based on actual model bounds
            const box3   = new THREE.Box3().setFromObject(model);
            const size3   = box3.getSize(new THREE.Vector3());
            const camDist = Math.max(size3.x, size3.y, size3.z) * 2.2;
            camera.position.set(0, 0, camDist);
            camera.lookAt(0, 0, 0);

            // ── Apply product image as texture ──
            model.traverse((child: any) => {
              if (!child.isMesh) return;
              child.castShadow    = true;
              child.receiveShadow = true;

              const applyTex = (mat: any) => {
                const m        = mat.clone();
                m.map          = frontTex;
                m.roughness    = 0.75;
                m.metalness    = 0.0;
                m.needsUpdate  = true;
                // Keep original colour if map is same as fallback
                if (!frontImage) { m.color = new THREE.Color(0x888888); }
                return m;
              };

              child.material = Array.isArray(child.material)
                ? child.material.map(applyTex)
                : applyTex(child.material);
            });

            scene.add(model);
            setState("ready");

            // ── Interaction ──
            let isDragging = false;
            let prevX = 0, prevY = 0;
            let targetY = 0, targetX = 0;
            let currY   = 0, currX   = 0;
            let velY    = 0;
            let auto    = true;

            const down  = (x: number, y: number) => { isDragging = true; auto = false; velY = 0; prevX = x; prevY = y; };
            const move  = (x: number, y: number) => { if (!isDragging) return; velY = (x - prevX) * 0.012; targetY += velY; targetX = Math.max(-0.4, Math.min(0.4, targetX + (y - prevY) * 0.006)); prevX = x; prevY = y; };
            const up    = () => { isDragging = false; };

            renderer.domElement.addEventListener("mousedown",  (e: MouseEvent) => down(e.clientX, e.clientY));
            window.addEventListener("mousemove",               (e: MouseEvent) => move(e.clientX, e.clientY));
            window.addEventListener("mouseup",                 up);
            renderer.domElement.addEventListener("touchstart", (e: TouchEvent) => down(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchmove",               (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener("touchend",                up);

            let frameId: number;
            const clock = new THREE.Clock();
            const tick  = () => {
              frameId = requestAnimationFrame(tick);
              const t = clock.getElapsedTime();
              if (auto)            { targetY += 0.003; }
              else if (!isDragging){ velY *= 0.90; targetY += velY; targetX *= 0.92; }
              currY += (targetY - currY) * 0.07;
              currX += (targetX - currX) * 0.07;
              model.rotation.y = currY;
              model.rotation.x = currX;
              model.position.y = Math.sin(t * 0.7) * 0.03;
              renderer.render(scene, camera);
            };
            tick();

            cleanupRef.current = () => {
              cancelAnimationFrame(frameId);
              renderer.dispose();
              if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
          },
          (xhr: any) => { if (xhr.total) setProgress(Math.round(xhr.loaded / xhr.total * 100)); },
          (err: any) => { console.error("GLB error:", err); setState("error"); }
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
            <div className="w-28 bg-base9-gray-800 h-0.5">
              <div className="h-full bg-base9-red transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="text-[9px] tracking-widest uppercase text-base9-gray-600">
            {progress > 0 ? `${progress}%` : "Loading..."}
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
