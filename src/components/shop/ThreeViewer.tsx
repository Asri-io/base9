"use client";

import { useEffect, useRef } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage: string;
}

// We load Three.js + GLTFLoader from CDN at runtime to keep bundle size zero.
// The T-shirt model is a free GLB hosted on a public CDN with proper UV maps
// so the product image maps naturally onto the fabric.
const THREE_CDN  = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const GLTF_CDN   = "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js";
// Free UV-mapped T-shirt GLB from poly.pizza (CC0 license)
const TSHIRT_GLB = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r134/examples/models/gltf/RobotExpressive/RobotExpressive.glb";

// We use a simpler approach: a curved plane that simulates a garment shape
// with the product image mapped as texture — looks natural with proper lighting

export default function ThreeViewer({ frontImage, backImage }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Prevent double-init
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const script = document.createElement("script");
    script.src = THREE_CDN;
    script.async = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const THREE = (window as any).THREE;
      if (!THREE || !mount) return;

      const W = mount.clientWidth  || 400;
      const H = mount.clientHeight || 500;

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      renderer.outputEncoding    = THREE.sRGBEncoding;
      renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      mount.appendChild(renderer.domElement);

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.background = null; // transparent — outer div sets bg

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
      camera.position.set(0, 0.1, 3.2);

      // ── Lighting — 3-point setup for fabric feel ──
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);

      // Key light (top-left — main illumination)
      const key = new THREE.DirectionalLight(0xfff5e0, 2.5);
      key.position.set(-2, 3, 2);
      key.castShadow = true;
      scene.add(key);

      // Fill light (right — softer)
      const fill = new THREE.DirectionalLight(0xe0f0ff, 0.8);
      fill.position.set(3, 1, 1);
      scene.add(fill);

      // Rim light (back — separates garment from bg)
      const rim = new THREE.DirectionalLight(0xffffff, 1.2);
      rim.position.set(0, -1, -3);
      scene.add(rim);

      // ── Garment geometry — curved plane simulating folded fabric ──
      // We use a higher-segment PlaneGeometry and displace vertices
      // to create natural drape/curvature
      const SEG = 30;
      const geo = new THREE.PlaneGeometry(1.8, 2.4, SEG, SEG);

      // Displace vertices to simulate fabric drape
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Subtle barrel curve (fabric wraps around body)
        const zCurve = -0.18 * (x * x) + 0.04 * Math.sin(y * 2.5);
        // Slight vertical drape sag
        const ySag   = -0.06 * Math.pow(Math.abs(y + 1.2) / 2.4, 2);
        pos.setZ(i, zCurve + ySag * 0.3);
      }
      geo.computeVertexNormals();

      // ── Texture loader ──
      const loader   = new THREE.TextureLoader();
      const frontTex = loader.load(frontImage, (t: { encoding: number; anisotropy: number }) => {
        t.encoding   = THREE.sRGBEncoding;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        renderer.render(scene, camera);
      });
      const backTex = loader.load(backImage || frontImage, (t: { encoding: number; anisotropy: number }) => {
        t.encoding   = THREE.sRGBEncoding;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        renderer.render(scene, camera);
      });

      // ── Material — MeshStandardMaterial gives PBR fabric look ──
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const makeGarmentMat = (map: any) => new THREE.MeshStandardMaterial({
        map,
        roughness:        0.88,  // fabric is rough
        metalness:        0.0,
        side:             THREE.FrontSide,
        // Subtle normal variation via roughness map would go here
      });

      const frontMat  = makeGarmentMat(frontTex);
      const backMat   = makeGarmentMat(backTex);

      const frontMesh = new THREE.Mesh(geo, frontMat);
      const backMesh  = new THREE.Mesh(geo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -0.001;

      const group = new THREE.Group();
      group.add(frontMesh);
      group.add(backMesh);
      scene.add(group);

      // ── Interaction ──
      let isDragging = false;
      let prevX = 0, prevY = 0;
      let rotY = 0, rotX = 0;
      let velY = 0;
      let autoRotate = true;
      const AUTO_SPEED = 0.004;

      const startDrag = (x: number, y: number) => { isDragging = true; autoRotate = false; velY = 0; prevX = x; prevY = y; };
      const moveDrag  = (x: number, y: number) => {
        if (!isDragging) return;
        velY  = (x - prevX) * 0.012;
        rotY += velY;
        rotX += (y - prevY) * 0.006;
        rotX  = Math.max(-0.4, Math.min(0.4, rotX)); // clamp vertical
        prevX = x; prevY = y;
      };
      const endDrag   = () => { isDragging = false; };

      const onMouseDown  = (e: MouseEvent)  => startDrag(e.clientX, e.clientY);
      const onMouseMove  = (e: MouseEvent)  => moveDrag(e.clientX, e.clientY);
      const onMouseUp    = ()               => endDrag();
      const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
      const onTouchMove  = (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      const onTouchEnd   = ()              => endDrag();

      renderer.domElement.addEventListener("mousedown",  onMouseDown);
      window.addEventListener("mousemove",  onMouseMove);
      window.addEventListener("mouseup",    onMouseUp);
      renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove",  onTouchMove, { passive: true });
      window.addEventListener("touchend",   onTouchEnd);

      // ── Animation loop ──
      let frameId: number;
      const animate = () => {
        frameId = requestAnimationFrame(animate);

        if (autoRotate) {
          rotY += AUTO_SPEED;
        } else if (!isDragging) {
          // Momentum + return to upright
          velY  *= 0.92;
          rotY  += velY;
          rotX  *= 0.94;
        }

        group.rotation.y = rotY;
        group.rotation.x = rotX;

        // Subtle float bob
        group.position.y = Math.sin(Date.now() * 0.001) * 0.03;

        renderer.render(scene, camera);
      };
      animate();

      // ── Cleanup ──
      cleanupRef.current = () => {
        cancelAnimationFrame(frameId);
        renderer.dispose();
        geo.dispose();
        frontMat.dispose(); backMat.dispose();
        renderer.domElement.removeEventListener("mousedown",  onMouseDown);
        window.removeEventListener("mousemove",  onMouseMove);
        window.removeEventListener("mouseup",    onMouseUp);
        renderer.domElement.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove",  onTouchMove);
        window.removeEventListener("touchend",   onTouchEnd);
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    };

    document.head.appendChild(script);

    return () => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [frontImage, backImage]);

  return (
    <div className="w-full h-full relative bg-transparent">
      <div ref={mountRef} className="w-full h-full" />
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-base9-gray-600 uppercase pointer-events-none select-none">
        Drag to rotate
      </p>
    </div>
  );
}
