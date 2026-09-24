"use client";

import { useEffect, useRef } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage: string;
}

export default function ThreeViewer({ frontImage, backImage }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Dynamically load Three.js from CDN to keep bundle size zero at build time
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const THREE = (window as any).THREE;
      if (!THREE || !mount) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf4f4f2);

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 3.5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      mount.appendChild(renderer.domElement);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(2, 4, 3);
      scene.add(dir);

      // Load textures
      const loader = new THREE.TextureLoader();
      const frontTex = loader.load(frontImage);
      const backTex = loader.load(backImage || frontImage);

      // Front plane
      const geo = new THREE.PlaneGeometry(1.6, 2, 1, 1);
      const frontMat = new THREE.MeshLambertMaterial({ map: frontTex, side: THREE.FrontSide });
      const frontMesh = new THREE.Mesh(geo, frontMat);
      frontMesh.position.z = 0.01;

      // Back plane (flipped)
      const backMat = new THREE.MeshLambertMaterial({ map: backTex, side: THREE.BackSide });
      const backMesh = new THREE.Mesh(geo, backMat);

      const group = new THREE.Group();
      group.add(frontMesh);
      group.add(backMesh);
      scene.add(group);

      // Drag rotation
      let isDragging = false;
      let prevX = 0;
      let rotY = 0;
      let autoRotate = true;

      const onMouseDown = (e: MouseEvent) => { isDragging = true; autoRotate = false; prevX = e.clientX; };
      const onMouseMove = (e: MouseEvent) => { if (!isDragging) return; rotY += (e.clientX - prevX) * 0.01; prevX = e.clientX; };
      const onMouseUp = () => { isDragging = false; };
      const onTouchStart = (e: TouchEvent) => { isDragging = true; autoRotate = false; prevX = e.touches[0].clientX; };
      const onTouchMove = (e: TouchEvent) => { if (!isDragging) return; rotY += (e.touches[0].clientX - prevX) * 0.01; prevX = e.touches[0].clientX; };
      const onTouchEnd = () => { isDragging = false; };

      renderer.domElement.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      renderer.domElement.addEventListener("touchstart", onTouchStart);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);

      let frameId: number;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (autoRotate) rotY += 0.005;
        group.rotation.y = rotY;
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup stored on mount element for later removal
      (mount as HTMLDivElement & { _cleanup?: () => void })._cleanup = () => {
        cancelAnimationFrame(frameId);
        renderer.dispose();
        renderer.domElement.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        renderer.domElement.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      };
    };

    document.head.appendChild(script);

    return () => {
      const m = mount as HTMLDivElement & { _cleanup?: () => void };
      if (m._cleanup) m._cleanup();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [frontImage, backImage]);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-base9-gray-400 uppercase pointer-events-none">
        Drag to rotate
      </p>
    </div>
  );
}
