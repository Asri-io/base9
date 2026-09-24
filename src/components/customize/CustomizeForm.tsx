"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle } from "lucide-react";

export default function CustomizeForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    garment: "T-Shirt",
    quantity: "1",
    size: "M",
    color: "Black",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let designUrl = null;

    if (designFile) {
      const ext = designFile.name.split(".").pop();
      const fileName = `custom-${Date.now()}.${ext}`;
      const { data } = await supabase.storage
        .from("custom-designs")
        .upload(fileName, designFile, { upsert: true });

      if (data) {
        const { data: urlData } = supabase.storage
          .from("custom-designs")
          .getPublicUrl(data.path);
        designUrl = urlData.publicUrl;
      }
    }

    const price = { "T-Shirt": 65, "Hoodie": 120, "Jacket": 285 }[form.garment] ?? 65;

    await supabase.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      items: [{
        garment: form.garment,
        size: form.size,
        color: form.color,
        quantity: Number(form.quantity),
      }],
      total: price * Number(form.quantity),
      status: "pending",
      notes: form.notes || null,
      custom_design_url: designUrl,
    });

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        <h3 className="text-xl font-bold text-base9-black">Order Submitted</h3>
        <p className="text-sm text-base9-gray-500">
          We&apos;ve received your request. Expect a reply within 24 hours at{" "}
          <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs tracking-widest uppercase text-base9-red hover:underline"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
          Phone (optional)
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
        />
      </div>

      {/* Garment selection */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Garment
          </label>
          <select
            value={form.garment}
            onChange={(e) => setForm({ ...form, garment: e.target.value })}
            className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black bg-white"
          >
            {["T-Shirt", "Hoodie", "Jacket"].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Size
          </label>
          <select
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black bg-white"
          >
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
          Base Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Black", "White", "Gray", "Navy", "Cream", "Olive"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`px-4 py-2 text-xs border transition-colors ${
                form.color === c
                  ? "border-base9-black bg-base9-black text-base9-white"
                  : "border-base9-gray-300 text-base9-gray-500 hover:border-base9-black"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Design upload */}
      <div>
        <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
          Upload Your Design (PNG, AI, PDF)
        </label>
        <label className="cursor-pointer block border-2 border-dashed border-base9-gray-300 hover:border-base9-black transition-colors p-8 text-center">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.ai,.pdf,.svg"
            className="hidden"
            onChange={(e) => setDesignFile(e.target.files?.[0] ?? null)}
          />
          {designFile ? (
            <div>
              <p className="text-sm font-medium text-base9-black">{designFile.name}</p>
              <p className="text-xs text-base9-gray-400 mt-1">Click to change</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-base9-gray-400 mx-auto" />
              <p className="text-sm text-base9-gray-400">Drop your file here or click to browse</p>
              <p className="text-xs text-base9-gray-300">Max 20MB — PNG, AI, PDF, SVG</p>
            </div>
          )}
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
          Additional Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
          className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black resize-none"
          placeholder="Placement, size of print, any special requests..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-base9-black text-base9-white py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Custom Order"}
      </button>
    </form>
  );
}
