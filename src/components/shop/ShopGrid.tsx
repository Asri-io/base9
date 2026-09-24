"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import type { Database } from "@/types/database";
import { formatPrice } from "@/lib/currency";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Jackets"];

const placeholders: Product[] = [
  { id:"1", slug:"oversized-graphic-tee", name:"Oversized Graphic Tee", price:15000, category:"T-Shirts", front_image:"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", back_image:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL"], colors:["Black","White"], description:"Premium oversized tee", stock:50, model_url:null, created_at:new Date().toISOString() },
  { id:"2", slug:"custom-pullover-hoodie", name:"Custom Pullover Hoodie", price:25000, category:"Hoodies", front_image:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80", back_image:"https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL","XXL"], colors:["Black","Gray"], description:"Heavyweight pullover", stock:30, model_url:null, created_at:new Date().toISOString() },
  { id:"3", slug:"bomber-jacket-custom", name:"Bomber Jacket", price:55000, category:"Jackets", front_image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", back_image:"https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=600&q=80", is_featured:true, is_published:true, sizes:["S","M","L","XL"], colors:["Black","Olive"], description:"Premium bomber", stock:15, model_url:null, created_at:new Date().toISOString() },
  { id:"4", slug:"essential-crop-tee", name:"Essential Crop Tee", price:12000, category:"T-Shirts", front_image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80", back_image:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80", is_featured:false, is_published:true, sizes:["XS","S","M","L"], colors:["White","Beige"], description:"Clean crop tee", stock:40, model_url:null, created_at:new Date().toISOString() },
  { id:"5", slug:"zip-up-hoodie", name:"Zip-Up Hoodie", price:28000, category:"Hoodies", front_image:"https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&q=80", back_image:"https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80", is_featured:false, is_published:true, sizes:["S","M","L","XL"], colors:["Black","Cream"], description:"Classic zip-up", stock:25, model_url:null, created_at:new Date().toISOString() },
  { id:"6", slug:"coach-jacket", name:"Coach Jacket", price:40000, category:"Jackets", front_image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80", back_image:"https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=600&q=80", is_featured:false, is_published:true, sizes:["S","M","L","XL"], colors:["Black","Navy"], description:"Lightweight coach jacket", stock:20, model_url:null, created_at:new Date().toISOString() },
];

function ProductCard({ product }: { product: Product }) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="group">
      <div className="relative bg-base9-gray-100 overflow-hidden mb-4 aspect-[3/4]">
        <div className="perspective w-full h-full">
          <div className={`flip-card-inner w-full h-full ${showBack ? "flipped" : ""}`}>
            <div className="backface-hidden absolute inset-0">
              <Image src={product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw,33vw" />
            </div>
            <div className="backface-hidden rotate-y-180 absolute inset-0">
              <Image src={product.back_image || product.front_image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"} alt={`${product.name} back`} fill className="object-cover" sizes="(max-width:768px) 50vw,33vw" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => setShowBack(!showBack)} className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-white/90 px-3 py-1.5 rounded-full text-base9-black hover:bg-base9-black hover:text-base9-white transition-colors">
            <RotateCcw size={10} />{showBack ? "Front" : "Back"}
          </button>
          <Link href={`/shop/${product.slug}`} className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase bg-base9-black/90 px-3 py-1.5 rounded-full text-base9-white hover:bg-base9-red transition-colors">
            View <ArrowRight size={10} />
          </Link>
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-[9px] tracking-ultra-wide uppercase bg-base9-white/80 px-2 py-1 text-base9-gray-500">{product.category}</span>
        </div>
      </div>
      <div className="flex items-start justify-between">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-medium text-base9-black hover:text-base9-red transition-colors">{product.name}</h3>
        </Link>
        <span className="text-sm font-light text-base9-gray-500 ml-4 shrink-0">{formatPrice(product.price)}</span>
      </div>
      <div className="flex gap-1 mt-1">
        {product.sizes.slice(0, 5).map(s => <span key={s} className="text-[9px] text-base9-gray-400">{s}</span>)}
      </div>
    </div>
  );
}

export default function ShopGrid({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const display  = products.length > 0 ? products : placeholders;
  const filtered = activeCategory === "All" ? display : display.filter(p => p.category === activeCategory);

  return (
    <div>
      <div className="flex gap-6 mb-10 border-b border-base9-gray-200 pb-4">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`text-xs tracking-widest uppercase pb-4 -mb-4 border-b-2 transition-colors ${
              activeCategory === cat ? "border-base9-black text-base9-black" : "border-transparent text-base9-gray-400 hover:text-base9-black"
            }`}>{cat}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
