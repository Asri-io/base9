"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { Database } from "@/types/database";
import { formatPrice } from "@/lib/currency";

type Product = Database["public"]["Tables"]["products"]["Row"];

const placeholderProducts = [
  { id:"1", slug:"oversized-graphic-tee", name:"Oversized Graphic Tee", price:15000, category:"T-Shirts", front_image:"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", back_image:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL"], colors:["Black","White"], description:"Premium oversized tee", stock:50, model_url:null, created_at:new Date().toISOString() },
  { id:"2", slug:"custom-pullover-hoodie", name:"Custom Pullover Hoodie", price:25000, category:"Hoodies", front_image:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80", back_image:"https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL","XXL"], colors:["Black","Gray"], description:"Heavyweight pullover", stock:30, model_url:null, created_at:new Date().toISOString() },
  { id:"3", slug:"bomber-jacket-custom", name:"Bomber Jacket", price:55000, category:"Jackets", front_image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", back_image:"https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL"], colors:["Black","Olive"], description:"Premium bomber", stock:15, model_url:null, created_at:new Date().toISOString() },
  { id:"4", slug:"essential-crop-tee", name:"Essential Crop Tee", price:12000, category:"T-Shirts", front_image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80", back_image:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80", is_featured:true, is_published:true, sizes:["XS","S","M","L"], colors:["White","Beige"], description:"Clean crop tee", stock:40, model_url:null, created_at:new Date().toISOString() },
];

function ProductCard({ product }: { product: Product | (typeof placeholderProducts)[0] }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="group relative">
      <div className="relative bg-base9-gray-100 overflow-hidden mb-4 aspect-[3/4]">
        <div className="perspective w-full h-full">
          <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
            <div className="backface-hidden absolute inset-0">
              <Image src={product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"} alt={`${product.name} front`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,25vw" />
            </div>
            <div className="backface-hidden rotate-y-180 absolute inset-0">
              <Image src={product.back_image || product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"} alt={`${product.name} back`} fill className="object-cover" sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,25vw" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => setShowBack(!showBack)} className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-base9-black hover:bg-base9-black hover:text-base9-white transition-colors">
            <RotateCcw size={10} />{showBack ? "Front" : "Back"}
          </button>
          <Link href={`/shop/${product.slug}`} className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-base9-white hover:bg-base9-red transition-colors">
            View <ArrowRight size={10} />
          </Link>
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-[9px] tracking-ultra-wide uppercase bg-base9-white/80 backdrop-blur-sm px-2 py-1 text-base9-gray-500">{product.category}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-sm font-medium text-base9-black hover:text-base9-red transition-colors leading-tight">{product.name}</h3>
          </Link>
          <span className="text-sm font-light text-base9-gray-500 ml-4 shrink-0">{formatPrice(product.price)}</span>
        </div>
        <div className="flex gap-1">
          {product.sizes.slice(0, 4).map(s => <span key={s} className="text-[9px] text-base9-gray-400">{s}</span>)}
          {product.sizes.length > 4 && <span className="text-[9px] text-base9-gray-400">+{product.sizes.length - 4}</span>}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const displayProducts = products.length > 0 ? products : placeholderProducts;
  return (
    <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-2">Our Collection</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base9-black">Featured Pieces</h2>
        </div>
        <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-black transition-colors border-b border-base9-gray-300 hover:border-base9-black pb-0.5">
          All Products <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {displayProducts.map(product => <ProductCard key={product.id} product={product as Product} />)}
      </div>
      <div className="mt-10 text-center md:hidden">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-black transition-colors border-b border-base9-gray-300 hover:border-base9-black pb-0.5">
          View All <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}

type Product = Database["public"]["Tables"]["products"]["Row"];

const placeholderProducts = [
  {
    id: "1",
    slug: "oversized-graphic-tee",
    name: "Oversized Graphic Tee",
    price: 65,
    category: "T-Shirts",
    front_image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    back_image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    is_featured: true,
    is_published: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    description: "Premium oversized tee with custom graphics",
    stock: 50,
    model_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "custom-pullover-hoodie",
    name: "Custom Pullover Hoodie",
    price: 120,
    category: "Hoodies",
    front_image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    back_image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80",
    is_featured: true,
    is_published: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Gray", "Navy"],
    description: "Heavyweight pullover with custom embroidery",
    stock: 30,
    model_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "bomber-jacket-custom",
    name: "Bomber Jacket",
    price: 285,
    category: "Jackets",
    front_image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    back_image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=600&q=80",
    is_featured: true,
    is_published: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Olive"],
    description: "Premium bomber with custom back print",
    stock: 15,
    model_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    slug: "essential-crop-tee",
    name: "Essential Crop Tee",
    price: 55,
    category: "T-Shirts",
    front_image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
    back_image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    is_featured: true,
    is_published: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Beige", "Black"],
    description: "Clean crop tee with minimal custom print",
    stock: 40,
    model_url: null,
    created_at: new Date().toISOString(),
  },
];

function ProductCard({ product }: { product: Product | (typeof placeholderProducts)[0] }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="group relative">
      {/* Image container */}
      <div className="relative bg-base9-gray-100 overflow-hidden mb-4 aspect-[3/4]">
        <div className="perspective w-full h-full">
          <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
            {/* Front */}
            <div className="backface-hidden absolute inset-0">
              <Image
                src={product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"}
                alt={`${product.name} front`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            {/* Back */}
            <div className="backface-hidden rotate-y-180 absolute inset-0">
              <Image
                src={product.back_image || product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"}
                alt={`${product.name} back`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          </div>
        </div>

        {/* Overlay controls */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setShowBack(!showBack)}
            className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-base9-black hover:bg-base9-black hover:text-base9-white transition-colors"
          >
            <RotateCcw size={10} />
            {showBack ? "Front" : "Back"}
          </button>

          <Link
            href={`/shop/${product.slug}`}
            className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-base9-white hover:bg-base9-red transition-colors"
          >
            View <ArrowRight size={10} />
          </Link>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[9px] tracking-ultra-wide uppercase bg-base9-white/80 backdrop-blur-sm px-2 py-1 text-base9-gray-500">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="text-sm font-medium text-base9-black hover:text-base9-red transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
          <span className="text-sm font-light text-base9-gray-500 ml-4 shrink-0">
            ${product.price}
          </span>
        </div>
        <div className="flex gap-1">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="text-[9px] text-base9-gray-400 tracking-wide">
              {size}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span className="text-[9px] text-base9-gray-400">+{product.sizes.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const displayProducts = products.length > 0 ? products : placeholderProducts;

  return (
    <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-2">
            Our Collection
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base9-black">
            Featured Pieces
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-black transition-colors border-b border-base9-gray-300 hover:border-base9-black pb-0.5"
        >
          All Products <ArrowRight size={12} />
        </Link>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>

      {/* Mobile see all */}
      <div className="mt-10 text-center md:hidden">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-black transition-colors border-b border-base9-gray-300 hover:border-base9-black pb-0.5"
        >
          View All Products <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
