"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeViewerProps {
  frontImage: string;
  backImage:  string;
  modelUrl?:  string;
}

const TEX_SIZE         = 2048;
const PRINT_ZONE_FRONT = { x: 0.28, y: 0.10, w: 0.44, h: 0.52 };

async function buildCompositeTexture(baseUrl: string, designUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas  = document.createElement("canvas");
    canvas.width  = TEX_SIZE;
    canvas.height = TEX_SIZE;
    const ctx     = canvas.getContext("2d")!;

    const base = new Image();
    base.crossOrigin = "anonymous";
    base.src = baseUrl;
    base.onload = () => {
      ctx.drawImage(base, 0, 0, TEX_SIZE, TEX_SIZE);

      const design = new Image();
      design.crossOrigin = "anonymous";
      design.src = designUrl;
      design.onload = () => {
        const { x, y, w, h } = PRINT_ZONE_FRONT;
        const px = x * TEX_SIZE, py = y * TEX_SIZE;
        const pw = w * TEX_SIZE, ph = h * TEX_SIZE;

        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.90;
        ctx.drawImage(design, px, py, pw, ph);
        ctx.restore();

        resolve(canvas.toDataURL("image/jpeg", 0.90));
      };
      design.onerror = () => resolve(canvas.toDataURL("image/jpeg", 0.90));
    };
    base.onerror  = () => resolve(""); // return empty on failure
  });
}

export default function ThreeViewer({ frontImage, backImage, modelUrl = "/models/jacket.glb" }: ThreeViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [state,    setState]    = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const [msg,      setMsg]      = useState("Loading 3D...");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const loadScript = (src: string): Promise<void> =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = Object.assign(document.createElement("script"), { src, async: true });
        s.onload = () => res(); s.onerror = () => rej(new Error(`Failed: ${src}`));
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        // Try npm package first (works on Vercel), fall back to CDN
        // Use new Function to bypass webpack static analysis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let THREE: any, GLTFLoader: any;

        try {
          // Dynamic require bypasses webpack bundling — only works at runtime
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dynamicRequire = new Function("m", "return import(m)") as (m: string) => Promise<any>;
          const threeModule    = await dynamicRequire("three").catch(() => null);
          const loaderModule   = threeModule
            ? await dynamicRequire("three/examples/jsm/loaders/GLTFLoader").catch(() => null)
            : null;

          if (threeModule && loaderModule) {
            THREE      = threeModule;
            GLTFLoader = loaderModule.GLTFLoader;
          }
        } catch { /* fall through to CDN */ }

        // CDN fallback
        if (!THREE) {
          setMsg("Loading engine...");
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          THREE      = (window as any).THREE;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          GLTFLoader = (window as any).THREE?.GLTFLoader;
        }

        if (!THREE || !GLTFLoader) throw new Error("Three.js not available");

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

        // Scene + camera
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, W / H, 0.001, 1000); // wider FOV fills frame better

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
        ([[ 0,  4,  5, 2.0], [-3,  2,  2, 1.2], [ 3,  1,  2, 0.8],
          [ 0, -2, -3, 0.5], [ 0,  3, -4, 0.7]] as [number,number,number,number][])
          .forEach(([x,y,z,i]) => { const l = new THREE.DirectionalLight(0xffffff, i); l.position.set(x,y,z); l.castShadow=true; scene.add(l); });

        // Only composite if we have a design image AND it's not a full product photo
        // A design image typically ends in .png (has transparency for clean compositing)
        // Full product JPG photos look bad when re-mapped — use model's own textures instead
        const isDesignImage = frontImage && (
          frontImage.toLowerCase().includes('.png') ||
          frontImage.toLowerCase().includes('design') ||
          frontImage.toLowerCase().includes('supabase') // uploaded via admin = design PNG
        );

        let customTexDataUrl = "";
        if (isDesignImage) {
          setMsg("Applying design...");
          try {
            customTexDataUrl = await buildCompositeTexture("/models/jacket_base_texture.jpg", frontImage);
          } catch { /* use model's own texture */ }
        }

        setMsg("Loading model...");
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          async (gltf: any) => {
            const model = gltf.scene;

            // Centre + scale — BIGGER (2.8 instead of 2.0)
            const box    = new THREE.Box3().setFromObject(model);
            const size   = box.getSize(new THREE.Vector3());
            const centre = box.getCenter(new THREE.Vector3());
            const scale  = 2.8 / Math.max(size.x, size.y, size.z);
            model.scale.setScalar(scale);
            model.position.set(-centre.x*scale, -centre.y*scale, -centre.z*scale);

            // Camera — tight fit using wide FOV (1.0x = fills frame completely)
            const scaledMax = Math.max(size.x, size.y) * scale;
            camera.position.z = (scaledMax / 2) / Math.tan(THREE.MathUtils.degToRad(50/2)) * 1.05;
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();

            // Start facing FRONT (π rotation so front faces camera)
            model.rotation.y = Math.PI;

            // Apply design texture if built successfully
            if (customTexDataUrl) {
              const tex   = new THREE.TextureLoader().load(customTexDataUrl);
              tex.encoding = THREE.sRGBEncoding;
              tex.flipY    = false;

              model.traverse((child: any) => {
                if (!child.isMesh) return;
                child.castShadow = child.receiveShadow = true;
                const apply = (m: any) => { const n=m.clone(); n.map=tex; n.needsUpdate=true; return n; };
                child.material = Array.isArray(child.material) ? child.material.map(apply) : apply(child.material);
              });
            } else {
              model.traverse((child: any) => {
                if (child.isMesh) { child.castShadow = child.receiveShadow = true; }
              });
            }

            scene.add(model);
            setState("ready");

            // Interaction
            let dragging=false, prevX=0, prevY=0, velY=0;
            // Try 0 rotation — Sketchfab models vary, some face front at 0, some at π
            let tY=0, tX=0, cY=0, cX=0, auto=true;
            model.rotation.y = 0;
            const centreY = centre.y * scale;

            const dn = (x:number,y:number) => { dragging=true; auto=false; velY=0; prevX=x; prevY=y; };
            const mv = (x:number,y:number) => { if(!dragging)return; velY=(x-prevX)*0.012; tY+=velY; tX=Math.max(-0.4,Math.min(0.4,tX+(y-prevY)*0.006)); prevX=x; prevY=y; };
            const up = () => { dragging=false; };

            renderer.domElement.addEventListener("mousedown",  (e:MouseEvent)  => dn(e.clientX,e.clientY));
            window.addEventListener("mousemove",               (e:MouseEvent)  => mv(e.clientX,e.clientY));
            window.addEventListener("mouseup",                 up);
            renderer.domElement.addEventListener("touchstart", (e:TouchEvent)  => dn(e.touches[0].clientX,e.touches[0].clientY), {passive:true});
            window.addEventListener("touchmove",               (e:TouchEvent)  => mv(e.touches[0].clientX,e.touches[0].clientY), {passive:true});
            window.addEventListener("touchend",                up);

            let frame:number;
            const clock = new THREE.Clock();
            const tick = () => {
              frame = requestAnimationFrame(tick);
              const t = clock.getElapsedTime();
              if(auto)          { tY+=0.002; }  // slower auto-rotation
              else if(!dragging){ velY*=0.90; tY+=velY; tX*=0.92; }
              cY+=(tY-cY)*0.07; cX+=(tX-cX)*0.07;
              model.rotation.y=cY; model.rotation.x=cX;
              model.position.y=-centreY+Math.sin(t*0.7)*0.04;
              renderer.render(scene,camera);
            };
            tick();

            cleanupRef.current = () => {
              cancelAnimationFrame(frame);
              renderer.dispose();
              if(mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
            };
          },
          (xhr:any) => { if(xhr.total){ const p=Math.round(xhr.loaded/xhr.total*100); setProgress(p); setMsg(`Model ${p}%`); } },
          (err:any) => { console.error("GLB:",err); setState("error"); }
        );
      } catch(e) {
        console.error("ThreeViewer:",e);
        setState("error");
      }
    };

    init();
    return () => { if(cleanupRef.current){ cleanupRef.current(); cleanupRef.current=null; } };
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
          <p className="text-[9px] tracking-widest uppercase text-base9-gray-600">{msg}</p>
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
