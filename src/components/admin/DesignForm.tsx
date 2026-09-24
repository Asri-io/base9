"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Upload } from "lucide-react";
import type { Database } from "@/types/database";

type Design = Database["public"]["Tables"]["designs"]["Row"];

interface Props {
  design: Design | null;
  onClose: () => void;
  onSave: () => void;
}

export default function DesignForm({ design, onClose, onSave }: Props) {
  const supabase = createClient();
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name:        design?.name ?? "",
    description: design?.description ?? "",
    image_url:   design?.image_url ?? "",
    category:    design?.category ?? "Graphic",
    tags:        design?.tags?.join(", ") ?? "",
    is_active:   design?.is_active ?? true,
  });

  const uploadDesignImage = async (file: File) => {
    setUploading(true);
    const ext      = file.name.split(".").pop();
    const fileName = `design-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("design-library")
      .upload(fileName, file, { upsert: true });

    if (error) { alert(`Upload failed: ${error.message}`); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("design-library").getPublicUrl(data.path);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) { alert("Please upload a design image first"); return; }
    setLoading(true);

    const payload = {
      name:        form.name,
      description: form.description || null,
      image_url:   form.image_url,
      category:    form.category,
      tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
      is_active:   form.is_active,
    };

    if (design) {
      await supabase.from("designs").update(payload).eq("id", design.id);
    } else {
      await supabase.from("designs").insert(payload);
    }

    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-base9-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base9-gray-200">
          <h3 className="text-sm font-bold tracking-widest uppercase text-base9-black">
            {design ? "Edit Design" : "Upload New Design"}
          </h3>
          <button onClick={onClose} className="text-base9-gray-400 hover:text-base9-black"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">
              Design Image *
            </label>
            <label className={`cursor-pointer block border-2 border-dashed p-6 text-center transition-colors ${
              form.image_url ? "border-base9-gray-200" : "border-base9-gray-300 hover:border-base9-black"
            }`}>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadDesignImage(e.target.files[0])} />
              {form.image_url ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="preview" className="w-full max-h-48 object-contain mx-auto" />
                  <p className="text-xs text-base9-gray-400">Click to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={28} className="mx-auto text-base9-gray-400" />
                  <p className="text-sm text-base9-gray-400">{uploading ? "Uploading..." : "Click to upload design image"}</p>
                  <p className="text-xs text-base9-gray-300">PNG, JPG, SVG — transparent background recommended</p>
                </div>
              )}
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Design Name *</label>
            <input type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
              placeholder="e.g. Dragon Eye Graphic" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black resize-none"
              placeholder="Brief description of the design..." />
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black bg-white">
                {["Graphic", "Typography", "Abstract", "Nature", "Culture", "Minimal", "Custom"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Tags</label>
              <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
                placeholder="bold, street, dark" />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-base9-red" />
            <span className="text-xs text-base9-gray-600">Active (visible to customers)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || uploading}
              className="flex-1 bg-base9-black text-base9-white py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-50">
              {loading ? "Saving..." : design ? "Save Changes" : "Upload Design"}
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
