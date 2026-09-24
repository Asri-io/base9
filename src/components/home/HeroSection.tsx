"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";

const heroProduct = {
  name: "Custom Bomber Jacket",
  price: 285,
  front: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=90",
  back: "https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=800&q=90",
  lining: "100% Polyester",
  size: "Available S–XXL",
  material: "Premium Fabric",
};

export default function HeroSection() {
  const [showBack, setShowBack] = useState(false);

  return (
    <section className="min-h-screen bg-base9-gray-100 relative overflow-hidden pt-16">
      {/* Background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #0A0A0A 0px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, #0A0A0A 0px, transparent 1px, transparent 80px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] items-center gap-8 py-12">

          {/* Left — Product info */}
          <div className="lg:col-span-4 animate-fade-up">
            <div className="space-y-2 mb-8">
              <p className="text-xs tracking-ultra-wide text-base9-gray-400 uppercase">
                Featured Drop
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-base9-black leading-tight">
                {heroProduct.name}
              </h1>
              <p className="text-3xl font-light text-base9-gray-400 mt-2">
                ${heroProduct.price}
              </p>
            </div>

            <div className="space-y-2 mb-8">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-base9-black text-base9-white px-6 py-3 text-sm tracking-widest uppercase font-medium hover:bg-base9-red transition-colors duration-300"
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <div className="block">
                <Link
                  href="/customize"
                  className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-medium text-base9-gray-500 hover:text-base9-black transition-colors border-b border-base9-gray-300 hover:border-base9-black pb-0.5 mt-3"
                >
                  Customize Yours
                </Link>
              </div>
            </div>

            {/* Slide indicators */}
            <div className="flex gap-2 mt-auto">
              <div className="w-8 h-0.5 bg-base9-black" />
              <div className="w-4 h-0.5 bg-base9-gray-300" />
              <div className="w-4 h-0.5 bg-base9-gray-300" />
            </div>
          </div>

          {/* Center — Product image with circle frame */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            {/* Circle background */}
            <div className="absolute w-[420px] h-[420px] lg:w-[520px] lg:h-[520px] rounded-full bg-base9-white shadow-sm" />

            {/* Product image */}
            <div className="relative z-10 w-[340px] h-[460px] lg:w-[420px] lg:h-[560px]">
              <div className="perspective w-full h-full">
                <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
                  {/* Front */}
                  <div className="backface-hidden absolute inset-0">
                    <Image
                      src={heroProduct.front}
                      alt={`${heroProduct.name} front`}
                      fill
                      className="object-contain object-bottom"
                      priority
                      sizes="(max-width: 768px) 340px, 420px"
                    />
                  </div>
                  {/* Back */}
                  <div className="backface-hidden rotate-y-180 absolute inset-0">
                    <Image
                      src={heroProduct.back}
                      alt={`${heroProduct.name} back`}
                      fill
                      className="object-contain object-bottom"
                      sizes="(max-width: 768px) 340px, 420px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flip button */}
            <button
              onClick={() => setShowBack(!showBack)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-black transition-colors bg-base9-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-base9-gray-200"
            >
              <RotateCcw size={12} />
              {showBack ? "View Front" : "View Back"}
            </button>
          </div>

          {/* Right — Product specs */}
          <div className="lg:col-span-3 space-y-6 animate-fade-up">
            {[
              { label: "Material", value: heroProduct.material },
              { label: "Lining", value: heroProduct.lining },
              { label: "Sizing", value: heroProduct.size },
              { label: "Print", value: "Custom / On Demand" },
            ].map((spec) => (
              <div key={spec.label} className="border-b border-base9-gray-200 pb-4">
                <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-1">
                  {spec.label}
                </p>
                <p className="text-sm font-medium text-base9-black">{spec.value}</p>
              </div>
            ))}

            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {["IG", "TW", "TK"].map((s) => (
                <span
                  key={s}
                  className="w-8 h-8 rounded-full border border-base9-gray-300 flex items-center justify-center text-[10px] tracking-wide text-base9-gray-500 hover:border-base9-black hover:text-base9-black cursor-pointer transition-colors"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand statement */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase">
          Your Vision — Our Craft
        </p>
      </div>
    </section>
  );
}
