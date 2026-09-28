"use client";

import { useEffect, useRef } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
}

const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";

export default function ThreeViewer({ frontImage, backImage }: ThreeViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const script    = document.createElement("script");
    script.src      = THREE_CDN;
    script.async    = true;

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
      renderer.shadowMap.enabled   = true;
      renderer.outputEncoding      = THREE.sRGBEncoding;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      mount.appendChild(renderer.domElement);

      // ── Scene ──
      const scene = new THREE.Scene();
      // No background — outer div handles the dark bg

      // ── Camera — pulled back enough to see the full garment ──
      const aspect = W / H;
      const camera = new THREE.PerspectiveCamera(28, aspect, 0.1, 100);
      camera.position.set(0, 0, 5.5);

      // ── Lighting ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      const key = new THREE.DirectionalLight(0xfff5e0, 2.0);
      key.position.set(-2, 3, 4);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xddeeff, 0.6);
      fill.position.set(3, 0, 2);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(0, -2, -4);
      scene.add(rim);

      // ── Garment geometry ──
      // Key: use correct aspect ratio so the garment image isn't stretched
      // Standard garment photo is roughly 3:4 (width:height)
      const GW   = 1.6;   // garment width in scene units
      const GH   = 2.0;   // garment height — 3:4 ratio
      const SEG  = 24;    // segments for smooth drape

      const geo = new THREE.PlaneGeometry(GW, GH, SEG, SEG);
      const pos = geo.attributes.position;

      // Gentle barrel curve — subtle, not aggressive
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Very subtle bow — makes it look like fabric on a mannequin
        const zCurve = -0.08 * (x * x);
        // Slight drape sag at bottom
        const ySag   = y < -0.5 ? -0.02 * Math.pow(Math.abs(y + GH / 2) / (GH / 2), 2) : 0;
        pos.setZ(i, zCurve + ySag);
      }
      geo.computeVertexNormals();

      // ── Textures ──
      const loader   = new THREE.TextureLoader();
      const frontTex = loader.load(frontImage);
      const backTex  = loader.load(backImage || frontImage);
      frontTex.encoding = THREE.sRGBEncoding;
      backTex.encoding  = THREE.sRGBEncoding;

      // ── Materials — fabric-like roughness ──
      const frontMat = new THREE.MeshStandardMaterial({
        map:       frontTex,
        roughness: 0.85,
        metalness: 0.0,
        side:      THREE.FrontSide,
      });
      const backMat = new THREE.MeshStandardMaterial({
        map:       backTex,
        roughness: 0.85,
        metalness: 0.0,
        side:      THREE.BackSide,
      });

      const frontMesh = new THREE.Mesh(geo, frontMat);
      const backMesh  = new THREE.Mesh(geo, backMat);

      const group = new THREE.Group();
      group.add(frontMesh);
      group.add(backMesh);
      scene.add(group);

      // ── Interaction ──
      let isDragging = false;
      let prevX = 0, prevY = 0;
      let targetRotY = 0, targetRotX = 0;
      let currentRotY = 0, currentRotX = 0;
      let velY = 0;
      let autoRotate = true;

      const onMouseDown  = (e: MouseEvent)  => { isDragging = true; autoRotate = false; velY = 0; prevX = e.clientX; prevY = e.clientY; };
      const onMouseMove  = (e: MouseEvent)  => { if (!isDragging) return; velY = (e.clientX - prevX) * 0.015; targetRotY += velY; targetRotX += (e.clientY - prevY) * 0.008; targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX)); prevX = e.clientX; prevY = e.clientY; };
      const onMouseUp    = ()               => { isDragging = false; };
      const onTouchStart = (e: TouchEvent)  => { isDragging = true; autoRotate = false; velY = 0; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
      const onTouchMove  = (e: TouchEvent)  => { if (!isDragging) return; velY = (e.touches[0].clientX - prevX) * 0.015; targetRotY += velY; targetRotX += (e.touches[0].clientY - prevY) * 0.008; targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX)); prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; };
      const onTouchEnd   = ()               => { isDragging = false; };

      renderer.domElement.addEventListener("mousedown",  onMouseDown);
      window.addEventListener("mousemove",  onMouseMove);
      window.addEventListener("mouseup",    onMouseUp);
      renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove",  onTouchMove, { passive: true });
      window.addEventListener("touchend",   onTouchEnd);

      // ── Animation loop with lerp for smoothness ──
      let frameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (autoRotate) {
          targetRotY += 0.003;
        } else if (!isDragging) {
          velY *= 0.90;
          targetRotY += velY;
          targetRotX *= 0.92;
        }

        // Smooth interpolation
        currentRotY += (targetRotY - currentRotY) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.08;

        group.rotation.y = currentRotY;
        group.rotation.x = currentRotX;

        // Subtle float
        group.position.y = Math.sin(t * 0.8) * 0.025;

        renderer.render(scene, camera);
      };
      animate();

      cleanupRef.current = () => {
        cancelAnimationFrame(frameId);
        renderer.dispose();
        geo.dispose();
        frontMat.dispose();
        backMat.dispose();
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
    </div>
  );
}
