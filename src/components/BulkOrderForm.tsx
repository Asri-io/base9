"use client";

import { useState } from "react";
import { createMutationClient } from "@/lib/supabase/client";
import { CheckCircle, Upload } from "lucide-react";

export default function BulkOrderForm() {
  const db = createMutationClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [briefFile, setBriefFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    organisation: "",
    quantity: "10",
    garments: "T-Shirts",
    deadline: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let briefUrl: string | null = null;
    if (briefFile) {
      const ext = briefFile.name.split(".").pop();
      const { data } = await db.storage.from("custom-designs")
        .upload(`bulk-brief-${Date.now()}.${ext}`, briefFile, { upsert: true });
      if (data) {
        const { data: u } = db.storage.from("custom-designs").getPublicUrl(data.path);
        briefUrl = u.publicUrl;
      }
    }

    await db.from("orders").insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      items: [{
        type: "bulk",
        garments: form.garments,
        quantity: Number(form.quantity),
        organisation: form.organisation,
        deadline: form.deadline,
      }],
      total: 0, // quoted manually
      status: "pending",
      notes: `BULK ORDER — ${form.organisation || "Individual"} — ${form.quantity} pcs ${form.garments}${form.deadline ? ` — Deadline: ${form.deadline}` : ""}${form.notes ? `\n\n${form.notes}` : ""}`,
      custom_design_url: briefUrl,
    });

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
        <h3 className="text-xl font-bold text-base9-black">Quote Request Received</h3>
        <p className="text-sm text-base9-gray-500 max-w-sm mx-auto leading-relaxed">
          We&apos;ll review your request and send a detailed quote to <strong>{form.email}</strong> within 24 hours.
        </p>
        <button onClick={() => setSuccess(false)}
          className="text-xs tracking-widest uppercase text-base9-red hover:underline">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-base9-gray-100 p-8">
      <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-6">Request a Quote</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Full Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
          </div>
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Phone / WhatsApp *</label>
            <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+234..."
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
          </div>
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Organisation / Brand</label>
            <input type="text" value={form.organisation} onChange={e => setForm({ ...form, organisation: e.target.value })}
              placeholder="e.g. Lagos FC, Acme Ltd"
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Total Quantity *</label>
            <input type="number" required min={5} value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
          </div>
          <div>
            <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Garment Type</label>
            <select value={form.garments} onChange={e => setForm({ ...form, garments: e.target.value })}
              className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black">
              {["T-Shirts", "Jackets", "Mix of T-Shirts & Jackets", "Other (specify in notes)"].map(g => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Deadline / Event Date</label>
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
            className="w-full bg-base9-white border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black" />
        </div>

        {/* Brief upload */}
        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">
            Design Brief / Artwork (optional)
          </label>
          <label className="cursor-pointer block border border-dashed border-base9-gray-300 bg-base9-white p-4 text-center hover:border-base9-black transition-colors">
            <input type="file" accept=".png,.jpg,.jpeg,.ai,.pdf,.svg,.zip" className="hidden"
              onChange={e => setBriefFile(e.target.files?.[0] ?? null)} />
            {briefFile ? (
              <p className="text-xs text-base9-black font-medium">{briefFile.name}</p>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Upload size={14} className="text-base9-gray-400" />
                <span className="text-xs text-base9-gray-400">Upload design file or ZIP</span>
              </div>
            )}
          </label>
        </div>

        <div>
          <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Additional Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
            placeholder="Size breakdown, colour preferences, print placement, any special requirements..."
            className="w-full bg-base9-white border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-base9-black text-base9-white py-4 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-50">
          {loading ? "Sending..." : "Request Quote"}
        </button>

        <p className="text-xs text-base9-gray-400 text-center leading-relaxed">
          We&apos;ll reply within 24 hours with pricing, timeline, and next steps.
        </p>
      </form>
    </div>
  );
}
