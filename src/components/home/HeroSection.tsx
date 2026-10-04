"use client";

import { useState, useRef, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw, Box } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

const ThreeViewer = lazy(() => import("@/components/shop/ThreeViewer"));

const FALLBACK = {
  name:        "Custom Bomber Jacket",
  price:       55000,
  front_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=90",
  back_image:  "https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=800&q=90",
  sizes:       ["S", "M", "L", "XL", "XXL"],
  slug:        "bomber-jacket-custom",
};

interface Props {
  product: Product | null;
  label?: string;
}

export default function HeroSection({ product, label = "Featured Drop" }: Props) {
  const [showBack, setShowBack] = useState(false);
  const [show3D,   setShow3D]   = useState(true);
  const [loaded,   setLoaded]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const name       = product?.name        ?? FALLBACK.name;
  const price      = product?.price       ?? FALLBACK.price;
  const frontImage = product?.front_image ?? FALLBACK.front_image;
  const backImage  = product?.back_image  ?? product?.front_image ?? FALLBACK.back_image;
  const slug       = product?.slug        ?? FALLBACK.slug;
  const sizes      = product?.sizes       ?? FALLBACK.sizes;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-base9-black overflow-hidden"
      style={{ paddingTop: "104px" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-base9-red/6 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-base9-gray-800/30 blur-[80px]" />
      </div>

      {/* Fine grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#fff 0px,transparent 1px,transparent 80px)" }} />

      {/* ── Two-column layout: text left, 3D right ── */}
      <div className="relative min-h-[calc(100vh-104px)] flex">

        {/* LEFT — text panel — 40% width */}
        <div className="w-full lg:w-[42%] flex flex-col justify-center px-10 lg:px-16 py-16 relative z-10">

          {/* Label */}
          <div className={`flex items-center gap-3 mb-6 transition-all duration-600 ${loaded ? "opacity-100" : "opacity-0 translate-y-4"}`}>
            <div className="w-6 h-px bg-base9-red" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-base9-gray-500">{label}</p>
          </div>

          {/* Product name — large editorial */}
          <h1 className="font-display text-[clamp(3.5rem,6vw,7rem)] leading-[0.85] text-base9-white uppercase tracking-tight mb-2">
            {name.split(" ").map((word, i) => (
              <span key={i} className="block overflow-hidden">
                <span
                  className={`block transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          {/* Animated underline */}
          <div className="h-px bg-base9-gray-800 overflow-hidden mb-8">
            <div className={`h-full bg-base9-red transition-all duration-1000 delay-600 ${loaded ? "w-full" : "w-0"}`} />
          </div>

          {/* Price */}
          <p className={`text-3xl font-light text-base9-white/50 mb-8 transition-all duration-700 delay-300 ${loaded ? "opacity-100" : "opacity-0 translate-y-4"}`}>
            {formatPrice(price)}
          </p>

          {/* CTAs */}
          <div className={`flex flex-col gap-3 mb-10 transition-all duration-700 delay-500 ${loaded ? "opacity-100" : "opacity-0 translate-y-4"}`}>
            <Link
              href={`/shop/${slug}`}
              className="group inline-flex items-center justify-between bg-base9-white text-base9-black px-6 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red hover:text-base9-white transition-all duration-300"
            >
              <span>Shop Now</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/customize"
              className="inline-flex items-center gap-2 text-xs tracking-ultra-wide uppercase text-base9-gray-500 hover:text-base9-white transition-colors border border-base9-gray-800 hover:border-base9-gray-600 px-6 py-4"
            >
              Customize Yours
            </Link>
          </div>

          {/* Specs */}
          <div className={`space-y-3 border-t border-base9-gray-800 pt-6 transition-all duration-700 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
            {[
              { label: "Material", value: "100% Premium Cotton" },
              { label: "Sizing",   value: sizes.length > 0 ? `${sizes[0]}–${sizes[sizes.length - 1]}` : "S–XXL" },
              { label: "Print",    value: "Custom / On Demand" },
            ].map(s => (
              <div key={s.label} className="flex justify-between">
                <span className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-600">{s.label}</span>
                <span className="text-xs text-base9-gray-400">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Collection details — bottom of left panel */}
          <div className="mt-auto pt-10 flex items-center gap-6">
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Drop</p>
              <p className="text-base9-white text-xs font-mono mt-0.5">001</p>
            </div>
            <div className="w-px h-8 bg-base9-gray-800" />
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Year</p>
              <p className="text-base9-white text-xs font-mono mt-0.5">2026</p>
            </div>
            <div className="w-px h-8 bg-base9-gray-800" />
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Origin</p>
              <p className="text-base9-white text-xs font-mono mt-0.5">NG</p>
            </div>
          </div>
        </div>

        {/* RIGHT — 3D viewer — 58% width, full height */}
        <div className="hidden lg:flex flex-col flex-1 relative">
          {/* The viewer takes the full right column */}
          <div className="flex-1 relative">
            {show3D ? (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="space-y-3 text-center">
                    <div className="w-10 h-10 border-2 border-base9-red border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] tracking-widest uppercase text-base9-gray-600">Loading 3D</p>
                  </div>
                </div>
              }>
                {/* Full-height full-width viewer */}
                <div className="absolute inset-0">
                  <ThreeViewer frontImage={frontImage} backImage={backImage} />
                </div>
              </Suspense>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="perspective w-[460px] h-[560px]">
                  <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
                    <div className="backface-hidden absolute inset-0">
                      <Image src={frontImage} alt={`${name} front`} fill
                        className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
                        priority sizes="460px" />
                    </div>
                    <div className="backface-hidden rotate-y-180 absolute inset-0">
                      <Image src={backImage} alt={`${name} back`} fill
                        className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
                        sizes="460px" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls at the bottom */}
          <div className="relative z-20 flex items-center justify-center gap-3 py-4 border-t border-base9-gray-900">
            {!show3D && (
              <button
                onClick={() => setShowBack(!showBack)}
                className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-base9-gray-500 hover:text-base9-white transition-colors px-4 py-2 border border-base9-gray-800 hover:border-base9-gray-600"
              >
                <RotateCcw size={10} />
                {showBack ? "Front" : "Back"}
              </button>
            )}
            {show3D && (
              <p className="text-[9px] tracking-widest uppercase text-base9-gray-700">
                Drag to rotate
              </p>
            )}
            <button
              onClick={() => setShow3D(!show3D)}
              className={`flex items-center gap-1.5 text-[10px] tracking-widest uppercase transition-colors px-4 py-2 border ${
                show3D
                  ? "text-base9-red border-base9-red/40"
                  : "text-base9-gray-500 border-base9-gray-800 hover:text-base9-white"
              }`}
            >
              <Box size={10} />
              {show3D ? "2D View" : "View 3D"}
            </button>
          </div>
        </div>

        {/* Mobile — 3D below text */}
        <div className="lg:hidden absolute inset-x-0 bottom-24 h-64">
          {show3D ? (
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-base9-red border-t-transparent rounded-full animate-spin" /></div>}>
              <ThreeViewer frontImage={frontImage} backImage={backImage} />
            </Suspense>
          ) : (
            <div className="relative w-full h-full">
              <Image src={frontImage} alt={name} fill className="object-contain" sizes="100vw" priority />
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-base9-gray-900 px-10 lg:px-16 py-3 flex items-center justify-between z-10">
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">
          Your Vision — Our Craft
        </p>
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">
          BASE<span className="text-base9-red">9</span>
        </p>
      </div>
    </section>
  );
}
