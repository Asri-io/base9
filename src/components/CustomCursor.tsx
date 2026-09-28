"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const onEnterLink = () => { ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(1.8)`; dot.style.opacity = "0"; };
    const onLeaveLink = () => { ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px) scale(1)`;   dot.style.opacity = "1"; };

    const lerp = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      raf = requestAnimationFrame(lerp);
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [role=button]").forEach(el => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    raf = requestAnimationFrame(lerp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-base9-red rounded-full pointer-events-none z-[9999] transition-opacity duration-200"
        style={{ willChange: "transform" }}
      />
      {/* Ring */}
      <div ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 border border-base9-red/50 rounded-full pointer-events-none z-[9998] transition-transform duration-100"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
