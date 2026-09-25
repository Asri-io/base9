import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Lookbook — BASE9",
  description: "Real pieces. Real people. See finished BASE9 custom orders.",
};

// Placeholder gallery items — replace with real photos via admin later
const placeholderItems = [
  { id: 1, src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85", label: "Custom Graphic Tee", span: "row-span-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=85", label: "Bomber Jacket — Back Print", span: "" },
  { id: 3, src: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=85", label: "Crop Tee — Minimal", span: "" },
  { id: 4, src: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=85", label: "Oversized Drop", span: "row-span-2" },
  { id: 5, src: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=85", label: "Back Detail", span: "" },
  { id: 6, src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=85", label: "Coach Jacket", span: "" },
  { id: 7, src: "https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=600&q=85", label: "Custom Back Emblem", span: "" },
  { id: 8, src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=85", label: "Street Tee", span: "" },
];

export default async function LookbookPage() {
  // In future: fetch from a lookbook table in Supabase
  // const supabase = await createClient();
  // const { data: items } = await supabase.from("lookbook").select("*").eq("is_active", true);

  return (
    <main className="min-h-screen bg-base9-black">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 px-6 lg:px-12 max-w-7xl mx-auto">
        <p className="text-[10px] tracking-ultra-wide text-base9-gray-600 uppercase mb-3">
          BASE9 Collection
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-5xl lg:text-6xl font-bold text-base9-white leading-none">
            Lookbook
          </h1>
          <p className="hidden md:block text-sm text-base9-gray-500 max-w-xs text-right leading-relaxed">
            Real pieces. Real people. Every item is custom-made — yours could be next.
          </p>
        </div>
        <div className="w-full h-px bg-base9-gray-800 mt-8" />
      </div>

      {/* Gallery grid */}
      <div className="px-6 lg:px-12 max-w-7xl mx-auto pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[280px]">
          {placeholderItems.map((item, i) => (
            <div
              key={item.id}
              className={`relative overflow-hidden group bg-base9-gray-800 ${item.span}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-base9-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-xs tracking-widest uppercase text-base9-white">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center space-y-4">
          <p className="text-base9-gray-500 text-sm">Want your piece in the lookbook?</p>
          <a
            href="/customize"
            className="inline-flex items-center gap-3 bg-base9-red text-base9-white px-8 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red-dark transition-colors"
          >
            Order Your Custom Piece
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
