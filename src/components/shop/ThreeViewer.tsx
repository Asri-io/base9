"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
  modelUrl?:  string;
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

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    // Dynamic import — three is now an npm dep so this works properly
    const init = async () => {
      try {
        const THREE      = await import("three");
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader");

        const W = mount.clientWidth  || 400;
        const H = mount.clientHeight || 500;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding      = THREE.sRGBEncoding;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled   = true;
        mount.appendChild(renderer.domElement);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, W / H, 0.001, 1000);
        camera.position.set(0, 0, 4);

        // Strong lighting from all angles
        scene.add(new THREE.AmbientLight(0xffffff, 1.8));
        ([[-1.5, 3, 3, 2.0], [3, 1, 2, 1.2], [0, -3, -3, 0.8]] as [number,number,number,number][]).forEach(([x,y,z,i]) => {
          const l = new THREE.DirectionalLight(0xffffff, i);
          l.position.set(x, y, z);
          scene.add(l);
        });

        const texLoader = new THREE.TextureLoader();
        const frontTex  = texLoader.load(frontImage);
        const backTex   = texLoader.load(backImage || frontImage);
        frontTex.encoding = THREE.sRGBEncoding;
        backTex.encoding  = THREE.sRGBEncoding;
        frontTex.flipY    = false;
        backTex.flipY     = false;

        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;

            // Auto-fit model to view
            const box     = new THREE.Box3().setFromObject(model);
            const size    = box.getSize(new THREE.Vector3());
            const centre  = box.getCenter(new THREE.Vector3());
            const maxDim  = Math.max(size.x, size.y, size.z);
            model.scale.setScalar(2.0 / maxDim);
            const box2    = new THREE.Box3().setFromObject(model);
            const centre2 = box2.getCenter(new THREE.Vector3());
            model.position.sub(centre2);

            // Camera distance based on model size
            const box3   = new THREE.Box3().setFromObject(model);
            const size3  = box3.getSize(new THREE.Vector3());
            camera.position.z = Math.max(size3.x, size3.y, size3.z) * 2.5;
            camera.updateProjectionMatrix();

            // Apply product image texture to all meshes
            model.traverse((child) => {
              if (!(child as THREE.Mesh).isMesh) return;
              const mesh = child as THREE.Mesh;
              mesh.castShadow = mesh.receiveShadow = true;
              const apply = (m: THREE.Material) => {
                const mat = (m as THREE.MeshStandardMaterial).clone() as THREE.MeshStandardMaterial;
                mat.map         = frontTex;
                mat.roughness   = 0.75;
                mat.metalness   = 0;
                mat.needsUpdate = true;
                return mat;
              };
              mesh.material = Array.isArray(mesh.material)
                ? mesh.material.map(apply)
                : apply(mesh.material as THREE.Material);
            });

            scene.add(model);
            setState("ready");

            let isDragging = false, prevX = 0, prevY = 0, velY = 0;
            let targetY = 0, targetX = 0, currY = 0, currX = 0, auto = true;

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
              if (auto)           { targetY += 0.003; }
              else if (!isDragging) { velY *= 0.90; targetY += velY; targetX *= 0.92; }
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
              renderer.domElement.removeEventListener("mousedown",  (e: MouseEvent) => down(e.clientX, e.clientY));
              window.removeEventListener("mousemove",               (e: MouseEvent) => move(e.clientX, e.clientY));
              window.removeEventListener("mouseup",                 up);
              if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
          },
          (xhr) => { if (xhr.total) setProgress(Math.round(xhr.loaded / xhr.total * 100)); },
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
            <div className="w-28 bg-base9-gray-800 h-0.5">
              <div className="h-full bg-base9-red transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="text-[9px] tracking-widest uppercase text-base9-gray-600">
            {progress > 0 ? `${progress}%` : "Loading 3D..."}
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
