"use client";

import { useState, Suspense, lazy } from "react";
import Image from "next/image";
import { RotateCcw, ShoppingBag, Box } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

const ThreeViewer = lazy(() => import("@/components/shop/ThreeViewer"));

export default function ProductDetail({ product }: { product: Product }) {
  const [showBack, setShowBack] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      image: product.front_image ?? "",
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left — Image viewer */}
          <div className="lg:col-span-7">
            <div className="relative bg-base9-gray-100 aspect-[4/5] overflow-hidden">
              {show3D ? (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs tracking-widest text-base9-gray-400 uppercase animate-pulse">
                        Loading 3D...
                      </p>
                    </div>
                  }
                >
                  <ThreeViewer
                    frontImage={product.front_image ?? ""}
                    backImage={product.back_image ?? ""}
                  />
                </Suspense>
              ) : (
                <div className="perspective w-full h-full">
                  <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
                    <div className="backface-hidden absolute inset-0">
                      <Image
                        src={product.front_image ?? "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=90"}
                        alt={`${product.name} front`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                    </div>
                    <div className="backface-hidden rotate-y-180 absolute inset-0">
                      <Image
                        src={product.back_image ?? product.front_image ?? "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=90"}
                        alt={`${product.name} back`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* View controls */}
              {!show3D && (
                <div className="absolute bottom-4 left-4">
                  <button
                    onClick={() => setShowBack(!showBack)}
                    className="flex items-center gap-2 text-xs tracking-widest uppercase bg-base9-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-base9-black hover:bg-base9-black hover:text-base9-white transition-colors"
                  >
                    <RotateCcw size={12} />
                    {showBack ? "View Front" : "View Back"}
                  </button>
                </div>
              )}

              {/* 3D toggle */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => setShow3D(!show3D)}
                  className="flex items-center gap-2 text-xs tracking-widest uppercase bg-base9-black/80 backdrop-blur-sm px-4 py-2 rounded-full text-base9-white hover:bg-base9-red transition-colors"
                >
                  <Box size={12} />
                  {show3D ? "2D View" : "View in 3D"}
                </button>
              </div>
            </div>
          </div>

          {/* Right — Product info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold text-base9-black mb-3">{product.name}</h1>
              <p className="text-2xl font-light text-base9-gray-500">{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <p className="text-sm text-base9-gray-500 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Color selection */}
            <div>
              <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-3">
                Color — <span className="text-base9-black">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs border transition-colors ${
                      selectedColor === color
                        ? "border-base9-black bg-base9-black text-base9-white"
                        : "border-base9-gray-300 text-base9-gray-500 hover:border-base9-black hover:text-base9-black"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div>
              <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-3">
                Size — <span className="text-base9-black">{selectedSize}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-xs border transition-colors ${
                      selectedSize === size
                        ? "border-base9-black bg-base9-black text-base9-white"
                        : "border-base9-gray-300 text-base9-gray-500 hover:border-base9-black hover:text-base9-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="border-t border-base9-gray-200 pt-6 space-y-3">
              {[
                { label: "Material", value: "100% Premium Cotton" },
                { label: "Print Method", value: "DTG / Screen Print" },
                { label: "Lead Time", value: "5–7 Business Days" },
                { label: "Shipping", value: "Free over $150" },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center justify-between">
                  <span className="text-xs tracking-wide text-base9-gray-400 uppercase">
                    {spec.label}
                  </span>
                  <span className="text-xs font-medium text-base9-black">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Add to cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs tracking-ultra-wide uppercase font-medium transition-colors duration-300 ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-base9-black text-base9-white hover:bg-base9-red"
                }`}
              >
                <ShoppingBag size={14} />
                {added ? "Added to Cart" : "Add to Cart"}
              </button>
              <a
                href="/customize"
                className="px-6 py-4 text-xs tracking-ultra-wide uppercase font-medium border border-base9-black text-base9-black hover:bg-base9-black hover:text-base9-white transition-colors text-center"
              >
                Customize
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
