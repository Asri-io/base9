"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Upload } from "lucide-react";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface Props {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductForm({ product, onClose, onSave }: Props) {
  const supabase = createClient();
  const [loading, setLoading]           = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack]   = useState(false);

  const [form, setForm] = useState({
    name:         product?.name ?? "",
    description:  product?.description ?? "",
    price:        product?.price ?? 0,
    category:     product?.category ?? "T-Shirts",
    stock:        product?.stock ?? 0,
    sizes:        product?.sizes?.join(", ") ?? "S, M, L, XL",
    colors:       product?.colors?.join(", ") ?? "Black, White",
    front_image:  product?.front_image ?? "",
    back_image:   product?.back_image ?? "",
    is_published: product?.is_published ?? false,
    is_featured:  product?.is_featured ?? false,
    slug:         product?.slug ?? "",
  });

  const uploadImage = async (file: File, side: "front" | "back") => {
    const setter = side === "front" ? setUploadingFront : setUploadingBack;
    setter(true);
    const ext      = file.name.split(".").pop();
    const fileName = `${Date.now()}-${side}.${ext}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (error) { alert(`Upload failed: ${error.message}`); setter(false); return; }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
    setForm(prev => ({ ...prev, [side === "front" ? "front_image" : "back_image"]: urlData.publicUrl }));
    setter(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const payload = {
      name:         form.name,
      description:  form.description || null,
      price:        Number(form.price),
      category:     form.category,
      stock:        Number(form.stock),
      sizes:        form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors:       form.colors.split(",").map(c => c.trim()).filter(Boolean),
      front_image:  form.front_image || null,
      back_image:   form.back_image || null,
      is_published: form.is_published,
      is_featured:  form.is_featured,
      slug,
    };

    if (product) {
      await supabase.from("products").update(payload).eq("id", product.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setLoading(false);
    onSave();
  };

  const ImageUploadSlot = ({ side }: { side: "front" | "back" }) => {
    const key       = side === "front" ? "front_image" : "back_image";
    const uploading = side === "front" ? uploadingFront : uploadingBack;

    return (
      <div>
        <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
          {side === "front" ? "Front Image" : "Back Image"}
        </label>
        <div className="border border-dashed border-base9-gray-300 p-4 text-center min-h-[120px] flex items-center justify-center">
          {form[key] ? (
            <div className="space-y-2 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form[key]} alt={`${side} preview`} className="w-full h-28 object-cover" />
              <button type="button" onClick={() => setForm(p => ({ ...p, [key]: "" }))}
                className="text-xs text-base9-red hover:underline">Remove</button>
            </div>
          ) : (
            <label className="cursor-pointer w-full">
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], side)} />
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} className="text-base9-gray-400" />
                <span className="text-xs text-base9-gray-400">
                  {uploading ? "Uploading..." : "Click to upload"}
                </span>
              </div>
            </label>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-base9-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base9-gray-200 sticky top-0 bg-base9-white z-10">
          <h3 className="text-sm font-bold tracking-widest uppercase text-base9-black">
            {product ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="text-base9-gray-400 hover:text-base9-black"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Product Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
              placeholder="e.g. Custom Bomber Jacket" />
          </div>

          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Product description..."
              className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Price (₦) *</label>
              <input type="number" required min={0} value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
            </div>
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black bg-white">
                {["T-Shirts", "Hoodies", "Jackets", "Accessories"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Stock</label>
              <input type="number" min={0} value={form.stock}
                onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Sizes (comma separated)</label>
              <input type="text" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
                placeholder="S, M, L, XL" />
            </div>
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Colors (comma separated)</label>
              <input type="text" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
                placeholder="Black, White, Gray" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploadSlot side="front" />
            <ImageUploadSlot side="back" />
          </div>

          <div className="flex gap-6">
            {[
              { label: "Published (Live on site)", key: "is_published" as const },
              { label: "Featured on Homepage",     key: "is_featured" as const },
            ].map(t => (
              <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[t.key]} onChange={e => setForm({ ...form, [t.key]: e.target.checked })}
                  className="w-4 h-4 accent-base9-red" />
                <span className="text-xs text-base9-gray-600">{t.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-base9-black text-base9-white py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-50">
              {loading ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 text-xs tracking-ultra-wide uppercase border border-base9-gray-300 text-base9-gray-500 hover:border-base9-black hover:text-base9-black transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
