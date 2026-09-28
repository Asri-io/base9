"use client";

import { useState, useRef, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw, Box, ChevronDown } from "lucide-react";
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
  const [show3D,   setShow3D]   = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const name       = product?.name        ?? FALLBACK.name;
  const price      = product?.price       ?? FALLBACK.price;
  const frontImage = product?.front_image ?? FALLBACK.front_image;
  const backImage  = product?.back_image  ?? product?.front_image ?? FALLBACK.back_image;
  const slug       = product?.slug        ?? FALLBACK.slug;
  const sizes      = product?.sizes       ?? FALLBACK.sizes;

  // Stagger entrance
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  // Scroll indicator
  const scrollDown = () => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement;
    next?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef}
      className="relative min-h-screen bg-base9-black overflow-hidden pt-[104px] flex flex-col">

      {/* ── Background layers ── */}

      {/* Deep radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-base9-red/5 blur-[120px]" />
      </div>

      {/* Fine grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0px,transparent 1px,transparent 60px)" }} />

      {/* Vertical collection label */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-10">
        <div className="w-px h-16 bg-base9-gray-700" />
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-600 [writing-mode:vertical-rl] rotate-180">
          Collection 2026
        </p>
        <div className="w-px h-16 bg-base9-gray-700" />
      </div>

      {/* Right index */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 z-10">
        {["01", "02", "03"].map((n, i) => (
          <div key={n} className={`text-[9px] tracking-widest font-mono ${i === 0 ? "text-base9-red" : "text-base9-gray-700"}`}>{n}</div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-7xl mx-auto px-12 lg:px-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-104px)] items-center gap-8 py-12">

          {/* ── LEFT: Text ── */}
          <div className="lg:col-span-4 space-y-8">
            {/* Eyebrow */}
            <div className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px bg-base9-red" />
                <p className="text-[10px] tracking-[0.4em] uppercase text-base9-gray-500">{label}</p>
              </div>

              {/* Big editorial title */}
              <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] text-base9-white uppercase tracking-tight mb-4">
                {name.split(" ").map((word, i) => (
                  <span key={i} className="block overflow-hidden">
                    <span className={`block transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                      style={{ transitionDelay: `${i * 120}ms` }}>
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              {/* Red underline that draws itself */}
              <div className="h-px bg-base9-gray-800 overflow-hidden">
                <div className={`h-full bg-base9-red transition-all duration-1000 delay-700 ${loaded ? "w-full" : "w-0"}`} />
              </div>
            </div>

            {/* Price */}
            <div className={`transition-all duration-700 delay-300 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-4xl font-light text-base9-white/60 tracking-tight">{formatPrice(price)}</p>
            </div>

            {/* CTAs */}
            <div className={`flex flex-col gap-3 transition-all duration-700 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Link href={`/shop/${slug}`}
                className="group inline-flex items-center justify-between bg-base9-white text-base9-black px-6 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red hover:text-base9-white transition-all duration-300">
                <span>Shop Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/customize"
                className="inline-flex items-center gap-2 text-xs tracking-ultra-wide uppercase text-base9-gray-500 hover:text-base9-white transition-colors border border-base9-gray-800 hover:border-base9-gray-600 px-6 py-4">
                Customize Yours
              </Link>
            </div>

            {/* Specs */}
            <div className={`space-y-3 pt-4 border-t border-base9-gray-800 transition-all duration-700 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
              {[
                { label: "Material", value: "100% Premium Cotton" },
                { label: "Sizing",   value: sizes.length > 0 ? `${sizes[0]}–${sizes[sizes.length - 1]}` : "S–XXL" },
                { label: "Print",    value: "Custom / On Demand" },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-600">{s.label}</span>
                  <span className="text-xs text-base9-gray-400">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CENTER: Product visual ── */}
          <div className="lg:col-span-6 flex items-center justify-center relative">

            {/* Decorative spinning ring */}
            <div className="absolute w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] rounded-full border border-base9-gray-800 animate-spin-slow pointer-events-none opacity-30" />
            <div className="absolute w-[400px] h-[400px] lg:w-[480px] lg:h-[480px] rounded-full border border-base9-red/10 animate-spin-slow pointer-events-none"
              style={{ animationDirection: "reverse", animationDuration: "30s" }} />

            {/* Glow behind product */}
            <div className="absolute w-64 h-64 rounded-full bg-base9-red/8 blur-3xl pointer-events-none" />

            {/* Product container */}
            <div className={`relative z-10 w-[320px] h-[440px] lg:w-[400px] lg:h-[540px] transition-all duration-1000 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

              {show3D ? (
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="space-y-2 text-center">
                      <div className="w-8 h-8 border border-base9-red border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] tracking-widest uppercase text-base9-gray-600">Loading 3D</p>
                    </div>
                  </div>
                }>
                  <ThreeViewer frontImage={frontImage} backImage={backImage} />
                </Suspense>
              ) : (
                <div className="perspective w-full h-full animate-float">
                  <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
                    {/* Front */}
                    <div className="backface-hidden absolute inset-0">
                      <Image src={frontImage} alt={`${name} front`} fill
                        className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]"
                        priority sizes="(max-width:768px) 320px,400px" />
                    </div>
                    {/* Back */}
                    <div className="backface-hidden rotate-y-180 absolute inset-0">
                      <Image src={backImage} alt={`${name} back`} fill
                        className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]"
                        sizes="(max-width:768px) 320px,400px" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Control buttons */}
            {!show3D && (
              <button onClick={() => setShowBack(!showBack)}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-widest uppercase text-base9-gray-500 hover:text-base9-white transition-colors px-4 py-2 border border-base9-gray-800 hover:border-base9-gray-600 bg-base9-black/80 backdrop-blur-sm">
                <RotateCcw size={10} />
                {showBack ? "Front" : "Back"}
              </button>
            )}

            {/* 3D toggle — bottom right */}
            <button onClick={() => setShow3D(!show3D)}
              className="absolute -bottom-0 right-0 flex items-center gap-2 text-[10px] tracking-widest uppercase text-base9-gray-500 hover:text-base9-red transition-colors px-3 py-2">
              <Box size={10} className={show3D ? "text-base9-red" : ""} />
              {show3D ? "2D" : "3D"}
            </button>
          </div>

          {/* ── RIGHT: Drop info ── */}
          <div className={`lg:col-span-2 space-y-6 transition-all duration-700 delay-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
            <div className="space-y-1">
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Drop</p>
              <p className="text-base9-white text-sm font-mono">001</p>
            </div>
            <div className="w-px h-12 bg-base9-gray-800 mx-auto" />
            <div className="space-y-1">
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Year</p>
              <p className="text-base9-white text-sm font-mono">2026</p>
            </div>
            <div className="w-px h-12 bg-base9-gray-800 mx-auto" />
            <div className="space-y-1">
              <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Made in</p>
              <p className="text-base9-white text-sm font-mono">NG</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-base9-gray-900 px-12 lg:px-20 py-4 flex items-center justify-between">
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">
          Your Vision — Our Craft
        </p>

        {/* Scroll indicator */}
        <button onClick={scrollDown}
          className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-base9-gray-700 hover:text-base9-white transition-colors animate-bounce">
          <ChevronDown size={12} />
          Scroll
        </button>

        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">
          BASE<span className="text-base9-red">9</span>
        </p>
      </div>
    </section>
  );
}
