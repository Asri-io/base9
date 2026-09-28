"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let raf: number;
    let hovered = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) setActive(true);
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };

    const lerp = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      const scale = hovered ? 1.8 : 1;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(${scale})`;
      dot.style.opacity = hovered ? "0" : "1";
      raf = requestAnimationFrame(lerp);
    };

    // Add listeners to all interactive elements
    const addListeners = () => {
      document.querySelectorAll("a, button, [role=button], input, select, textarea, label").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    document.addEventListener("mousemove", onMove);
    addListeners();
    raf = requestAnimationFrame(lerp);

    // Re-add on DOM changes (for dynamic content)
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 bg-base9-red rounded-full pointer-events-none z-[9999] transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      />
      <div ref={ringRef}
        className={`fixed top-0 left-0 w-10 h-10 border border-base9-red/40 rounded-full pointer-events-none z-[9998] transition-[transform,opacity] duration-150 ${active ? "opacity-100" : "opacity-0"}`}
        style={{ willChange: "transform" }}
      />
    </>
  );
}
