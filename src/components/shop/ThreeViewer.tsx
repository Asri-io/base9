"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
  modelUrl?:  string;
}

// Inline worker code that sets up the 3D scene via a module script tag
// Uses ES module imports directly — no CDN timing issues, no window.THREE dependency
const VIEWER_SCRIPT = `
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

const { mountId, modelUrl, frontImage, backImage } = window.__base9ViewerConfig;
const mount = document.getElementById(mountId);
if (!mount) throw new Error('mount not found');

const W = mount.clientWidth  || 400;
const H = mount.clientHeight || 500;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding      = THREE.sRGBEncoding;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled   = true;
mount.appendChild(renderer.domElement);
mount.__renderer = renderer;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(35, W / H, 0.001, 1000);
camera.position.set(0, 0, 4);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.8));
[[0, 5, 5, 2.0], [-5, 3, 2, 1.5], [5, 1, 2, 1.0], [0, -3, -4, 0.8]].forEach(([x, y, z, i]) => {
  const l = new THREE.DirectionalLight(0xffffff, i);
  l.position.set(x, y, z);
  scene.add(l);
});

// Load texture
const texLoader = new THREE.TextureLoader();
const tex = texLoader.load(frontImage);
tex.encoding = THREE.sRGBEncoding;
tex.flipY    = false;

// Dispatch progress
const dispatchProgress = (p) => mount.dispatchEvent(new CustomEvent('viewerprogress', { detail: p }));
const dispatchReady    = ()  => mount.dispatchEvent(new CustomEvent('viewerready'));
const dispatchError    = ()  => mount.dispatchEvent(new CustomEvent('viewererror'));

// Load model
const loader = new GLTFLoader();
loader.load(modelUrl,
  (gltf) => {
    const model = gltf.scene;

    // Auto-fit
    const box = new THREE.Box3().setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = 2.0 / maxDim;
    model.scale.setScalar(scale);
    const box2    = new THREE.Box3().setFromObject(model);
    const centre2 = box2.getCenter(new THREE.Vector3());
    model.position.sub(centre2);

    // Set camera
    const box3  = new THREE.Box3().setFromObject(model);
    const size3  = box3.getSize(new THREE.Vector3());
    camera.position.z = Math.max(size3.x, size3.y, size3.z) * 2.5;
    camera.updateProjectionMatrix();

    // Apply texture to all meshes
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = child.receiveShadow = true;
      const apply = (m) => { const n = m.clone(); n.map = tex; n.roughness = 0.75; n.metalness = 0; n.needsUpdate = true; return n; };
      child.material = Array.isArray(child.material) ? child.material.map(apply) : apply(child.material);
    });

    scene.add(model);
    dispatchReady();

    // Interaction
    let dragging = false, prevX = 0, prevY = 0, velY = 0;
    let targetY = 0, targetX = 0, currY = 0, currX = 0, auto = true;

    renderer.domElement.addEventListener('mousedown',  (e) => { dragging = true; auto = false; velY = 0; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mousemove',               (e) => { if (!dragging) return; velY = (e.clientX - prevX) * 0.012; targetY += velY; targetX = Math.max(-0.4, Math.min(0.4, targetX + (e.clientY - prevY) * 0.006)); prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup',                 ()  => { dragging = false; });
    renderer.domElement.addEventListener('touchstart', (e) => { dragging = true; auto = false; velY = 0; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove',               (e) => { if (!dragging) return; velY = (e.touches[0].clientX - prevX) * 0.012; targetY += velY; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend',                ()  => { dragging = false; });

    const clock = new THREE.Clock();
    let frame;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      if (auto)             { targetY += 0.003; }
      else if (!dragging)   { velY *= 0.90; targetY += velY; targetX *= 0.92; }
      currY += (targetY - currY) * 0.07;
      currX += (targetX - currX) * 0.07;
      model.rotation.y = currY;
      model.rotation.x = currX;
      model.position.y = Math.sin(t * 0.7) * 0.03;
      renderer.render(scene, camera);
    };
    tick();
    mount.__cancelFrame = () => cancelAnimationFrame(frame);
  },
  (xhr) => { if (xhr.total) dispatchProgress(Math.round(xhr.loaded / xhr.total * 100)); },
  (err) => { console.error('GLB error', err); dispatchError(); }
);
`;

export default function ThreeViewer({ frontImage, backImage, modelUrl = "/models/jacket.glb" }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [state,    setState]    = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const mountId = useRef(`viewer-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.id = mountId.current;

    // Set config on window so the module script can read it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__base9ViewerConfig = { mountId: mountId.current, modelUrl, frontImage, backImage };

    // Listen for events from the module script
    const onProgress = (e: Event) => setProgress((e as CustomEvent).detail);
    const onReady    = ()          => setState("ready");
    const onError    = ()          => setState("error");
    mount.addEventListener("viewerprogress", onProgress);
    mount.addEventListener("viewerready",    onReady);
    mount.addEventListener("viewererror",    onError);

    // Inject the module script
    const script    = document.createElement("script");
    script.type     = "module";
    script.textContent = VIEWER_SCRIPT;
    document.head.appendChild(script);

    return () => {
      mount.removeEventListener("viewerprogress", onProgress);
      mount.removeEventListener("viewerready",    onReady);
      mount.removeEventListener("viewererror",    onError);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = mount as any;
      if (m.__cancelFrame)   m.__cancelFrame();
      if (m.__renderer)      m.__renderer.dispose();
      const canvas = mount.querySelector("canvas");
      if (canvas) mount.removeChild(canvas);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
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
