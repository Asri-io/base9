"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeViewerProps {
  frontImage: string;
  backImage: string;
}

export default function ThreeViewer({ frontImage, backImage }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

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
    mountRef.current.appendChild(renderer.domElement);

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

    // Simple garment shape — two planes (front & back)
    const geo = new THREE.PlaneGeometry(1.6, 2, 20, 20);

    // Front face
    const frontMat = new THREE.MeshLambertMaterial({ map: frontTex, side: THREE.FrontSide });
    const frontMesh = new THREE.Mesh(geo, frontMat);
    frontMesh.position.z = 0.01;
    scene.add(frontMesh);

    // Back face
    const backMat = new THREE.MeshLambertMaterial({ map: backTex, side: THREE.BackSide });
    const backMesh = new THREE.Mesh(geo, backMat);
    scene.add(backMesh);

    // Group for rotation
    const group = new THREE.Group();
    group.add(frontMesh);
    group.add(backMesh);
    scene.add(group);

    // Mouse drag rotation
    let isDragging = false;
    let prevX = 0;
    let rotY = 0;
    let autoRotate = true;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - prevX;
      rotY += delta * 0.01;
      prevX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const delta = e.touches[0].clientX - prevX;
      rotY += delta * 0.01;
      prevX = e.touches[0].clientX;
    };
    const onTouchEnd = () => { isDragging = false; };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (autoRotate) rotY += 0.005;
      group.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
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
