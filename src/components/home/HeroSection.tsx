"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

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
  const [loaded,   setLoaded]   = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const name       = product?.name        ?? FALLBACK.name;
  const price      = product?.price       ?? FALLBACK.price;
  const frontImage = product?.front_image ?? FALLBACK.front_image;
  const backImage  = product?.back_image  ?? product?.front_image ?? FALLBACK.back_image;
  const slug       = product?.slug        ?? FALLBACK.slug;
  const sizes      = product?.sizes       ?? FALLBACK.sizes;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const scrollDown = () => {
    const next = sectionRef.current?.nextElementSibling as HTMLElement;
    next?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-base9-black overflow-hidden"
      style={{ paddingTop: "104px" }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-base9-red/5 blur-[120px]" />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#fff 0px,transparent 1px,transparent 80px)" }} />

      {/* Main split layout */}
      <div className="relative min-h-[calc(100vh-104px)] grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT — Text */}
        <div className="flex flex-col justify-center px-10 lg:px-16 py-16 relative z-10">

          {/* Label */}
          <div className={`flex items-center gap-3 mb-5 transition-all duration-500 ${loaded ? "opacity-100" : "opacity-0 translate-y-3"}`}>
            <div className="w-5 h-px bg-base9-red" />
            <p className="text-[10px] tracking-[0.4em] uppercase text-base9-gray-500">{label}</p>
          </div>

          {/* Name */}
          <h1 className="font-display text-[clamp(3.5rem,6vw,7.5rem)] leading-[0.85] text-base9-white uppercase tracking-tight mb-3">
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

          {/* Animated red underline */}
          <div className="h-px bg-base9-gray-800 overflow-hidden mb-7">
            <div className={`h-full bg-base9-red transition-all duration-1000 delay-500 ${loaded ? "w-full" : "w-0"}`} />
          </div>

          {/* Price */}
          <p className={`text-3xl lg:text-4xl font-light text-base9-white/50 mb-8 transition-all duration-700 delay-200 ${loaded ? "opacity-100" : "opacity-0 translate-y-3"}`}>
            {formatPrice(price)}
          </p>

          {/* CTAs */}
          <div className={`flex flex-col gap-3 mb-10 transition-all duration-700 delay-400 ${loaded ? "opacity-100" : "opacity-0 translate-y-3"}`}>
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
          <div className={`space-y-3 border-t border-base9-gray-800 pt-6 transition-all duration-700 delay-600 ${loaded ? "opacity-100" : "opacity-0"}`}>
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

          {/* Drop info */}
          <div className={`mt-auto pt-10 flex items-center gap-6 transition-all duration-700 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}>
            {[
              { label: "Drop", value: "001" },
              { label: "Year", value: "2026" },
              { label: "Origin", value: "NG" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-6">
                <div>
                  <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">{item.label}</p>
                  <p className="text-base9-white text-xs font-mono mt-0.5">{item.value}</p>
                </div>
                {i < 2 && <div className="w-px h-8 bg-base9-gray-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Product image with flip */}
        <div className={`relative flex items-center justify-center transition-all duration-1000 delay-100 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

          {/* Decorative ring */}
          <div className="absolute w-[400px] h-[400px] lg:w-[520px] lg:h-[520px] rounded-full border border-base9-gray-800 animate-spin-slow pointer-events-none opacity-20" />
          <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full border border-base9-red/10 animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
          <div className="absolute w-52 h-52 rounded-full bg-base9-red/6 blur-3xl pointer-events-none" />

          {/* Product — large, fills the column */}
          <div className="relative w-[320px] h-[420px] sm:w-[380px] sm:h-[500px] lg:w-[440px] lg:h-[580px] z-10">
            <div className="perspective w-full h-full">
              <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
                <div className="backface-hidden absolute inset-0">
                  <Image
                    src={frontImage}
                    alt={`${name} front`}
                    fill
                    className="object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
                    priority
                    sizes="(max-width:768px) 320px,(max-width:1024px) 380px,440px"
                  />
                </div>
                <div className="backface-hidden rotate-y-180 absolute inset-0">
                  <Image
                    src={backImage}
                    alt={`${name} back`}
                    fill
                    className="object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
                    sizes="(max-width:768px) 320px,(max-width:1024px) 380px,440px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flip button */}
          <button
            onClick={() => setShowBack(!showBack)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] tracking-widest uppercase text-base9-gray-500 hover:text-base9-white transition-colors px-5 py-2.5 border border-base9-gray-800 hover:border-base9-gray-600 bg-base9-black/60 backdrop-blur-sm z-20"
          >
            <RotateCcw size={10} />
            {showBack ? "View Front" : "View Back"}
          </button>

          {/* View in 3D hint */}
          <Link href={`/shop/${slug}`}
            className="absolute top-8 right-8 text-[9px] tracking-widest uppercase text-base9-gray-700 hover:text-base9-red transition-colors z-20">
            View in 3D →
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-base9-gray-900 px-10 lg:px-16 py-3 flex items-center justify-between z-10">
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">Your Vision — Our Craft</p>
        <button onClick={scrollDown} className="text-[9px] tracking-widest uppercase text-base9-gray-700 hover:text-base9-white transition-colors">
          Scroll ↓
        </button>
        <p className="text-[9px] tracking-[0.4em] uppercase text-base9-gray-700">BASE<span className="text-base9-red">9</span></p>
      </div>
    </section>
  );
}
