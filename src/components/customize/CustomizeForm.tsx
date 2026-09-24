"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Upload, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import type { Database } from "@/types/database";

type Design = Database["public"]["Tables"]["designs"]["Row"];

type DesignMode = "pick" | "upload";

const PRICES: Record<string, number> = {
  "T-Shirt": 15000,
  "Hoodie":  25000,
  "Jacket":  55000,
};

export default function CustomizeForm() {
  const supabase = createClient();

  // Step: 1 = garment + details, 2 = design, 3 = contact + confirm
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [designs, setDesigns]     = useState<Design[]>([]);
  const [designMode, setDesignMode] = useState<DesignMode>("pick");
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [designCategory, setDesignCategory] = useState("All");

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    whatsapp: "",
    address:  "",
    garment:  "T-Shirt",
    quantity: 1,
    size:     "M",
    color:    "Black",
    notes:    "",
  });

  useEffect(() => {
    supabase.from("designs").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setDesigns(data ?? []));
  }, [supabase]);

  const categories = ["All", ...Array.from(new Set(designs.map(d => d.category)))];
  const filteredDesigns = designCategory === "All" ? designs : designs.filter(d => d.category === designCategory);

  const price    = PRICES[form.garment] ?? 15000;
  const total    = price * form.quantity;
  const canNext1 = form.garment && form.size && form.color && form.quantity > 0;
  const canNext2 = designMode === "pick" ? !!selectedDesign : !!designFile;
  const canSubmit = form.name && form.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);

    let customDesignUrl: string | null = null;
    let selectedDesignUrl: string | null = null;
    let selectedDesignId: string | null = null;

    if (designMode === "upload" && designFile) {
      const ext      = designFile.name.split(".").pop();
      const fileName = `custom-${Date.now()}.${ext}`;
      const { data } = await supabase.storage.from("custom-designs").upload(fileName, designFile, { upsert: true });
      if (data) {
        const { data: u } = supabase.storage.from("custom-designs").getPublicUrl(data.path);
        customDesignUrl = u.publicUrl;
      }
    } else if (designMode === "pick" && selectedDesign) {
      selectedDesignId  = selectedDesign.id;
      selectedDesignUrl = selectedDesign.image_url;
    }

    await supabase.from("orders").insert({
      customer_name:        form.name,
      customer_email:       form.email,
      customer_phone:       form.phone || null,
      whatsapp:             form.whatsapp || null,
      address:              form.address || null,
      items: [{
        garment:  form.garment,
        size:     form.size,
        color:    form.color,
        quantity: form.quantity,
        price,
      }],
      total,
      status:               "pending",
      notes:                form.notes || null,
      custom_design_url:    customDesignUrl,
      selected_design_id:   selectedDesignId,
      selected_design_url:  selectedDesignUrl,
    });

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
        <h3 className="text-2xl font-bold text-base9-black">Order Received!</h3>
        <p className="text-sm text-base9-gray-500 max-w-sm mx-auto leading-relaxed">
          We&apos;ve received your order and will contact you at <strong>{form.email}</strong> within 24 hours to confirm and process payment.
        </p>
        <div className="bg-base9-gray-100 inline-block px-6 py-3 mt-4">
          <p className="text-xs text-base9-gray-400 uppercase tracking-widest mb-1">Order Total</p>
          <p className="text-2xl font-bold text-base9-black">{formatPrice(total)}</p>
        </div>
        <div className="pt-4">
          <button onClick={() => { setSuccess(false); setStep(1); setSelectedDesign(null); setDesignFile(null); }}
            className="text-xs tracking-widest uppercase text-base9-red hover:underline">
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[
          { n: 1, label: "Garment" },
          { n: 2, label: "Design" },
          { n: 3, label: "Confirm" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${step >= s.n ? "text-base9-black" : "text-base9-gray-300"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                step > s.n ? "bg-base9-red text-white" : step === s.n ? "bg-base9-black text-white" : "bg-base9-gray-200 text-base9-gray-400"
              }`}>{s.n}</div>
              <span className="text-[10px] tracking-ultra-wide uppercase hidden sm:block">{s.label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px w-8 ${step > s.n ? "bg-base9-red" : "bg-base9-gray-200"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── STEP 1: Garment ── */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PRICES).map(([g, p]) => (
                <button key={g} type="button" onClick={() => setForm({ ...form, garment: g })}
                  className={`p-4 border text-left transition-colors ${
                    form.garment === g ? "border-base9-black bg-base9-black text-base9-white" : "border-base9-gray-300 hover:border-base9-black"
                  }`}>
                  <p className="text-sm font-medium">{g}</p>
                  <p className={`text-xs mt-1 ${form.garment === g ? "text-base9-gray-300" : "text-base9-gray-400"}`}>{formatPrice(p)}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">Size</label>
                <div className="flex gap-2 flex-wrap">
                  {["XS","S","M","L","XL","XXL"].map(s => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, size: s })}
                      className={`w-11 h-11 text-xs border transition-colors ${
                        form.size === s ? "border-base9-black bg-base9-black text-base9-white" : "border-base9-gray-300 hover:border-base9-black"
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                    className="w-10 h-10 border border-base9-gray-300 text-base9-black hover:border-base9-black text-lg">−</button>
                  <span className="text-lg font-medium w-8 text-center">{form.quantity}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                    className="w-10 h-10 border border-base9-gray-300 text-base9-black hover:border-base9-black text-lg">+</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">Base Colour</label>
              <div className="flex gap-2 flex-wrap">
                {["Black","White","Gray","Navy","Cream","Olive","Red","Burgundy"].map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`px-4 py-2 text-xs border transition-colors ${
                      form.color === c ? "border-base9-black bg-base9-black text-base9-white" : "border-base9-gray-300 text-base9-gray-500 hover:border-base9-black"
                    }`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-base9-gray-200 pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400">Estimated Total</p>
                <p className="text-xl font-bold text-base9-black">{formatPrice(total)}</p>
              </div>
              <button type="button" disabled={!canNext1} onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-6 py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-40">
                Next: Design <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Design ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-base9-gray-100 p-1 w-fit">
              {(["pick", "upload"] as DesignMode[]).map(m => (
                <button key={m} type="button" onClick={() => setDesignMode(m)}
                  className={`px-5 py-2 text-xs tracking-widest uppercase transition-colors ${
                    designMode === m ? "bg-base9-black text-base9-white" : "text-base9-gray-500 hover:text-base9-black"
                  }`}>
                  {m === "pick" ? "Pick a Design" : "Upload My Design"}
                </button>
              ))}
            </div>

            {designMode === "pick" && (
              <div className="space-y-4">
                {/* Category filter */}
                {categories.length > 2 && (
                  <div className="flex gap-3 flex-wrap">
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => setDesignCategory(cat)}
                        className={`text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                          designCategory === cat ? "border-base9-black bg-base9-black text-base9-white" : "border-base9-gray-300 text-base9-gray-400 hover:border-base9-black"
                        }`}>{cat}</button>
                    ))}
                  </div>
                )}

                {filteredDesigns.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-base9-gray-300">
                    <p className="text-sm text-base9-gray-400">No designs available yet.</p>
                    <p className="text-xs text-base9-gray-300 mt-1">Switch to &quot;Upload My Design&quot; to submit your own.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredDesigns.map(d => (
                      <button key={d.id} type="button" onClick={() => setSelectedDesign(d)}
                        className={`relative border-2 transition-all text-left group ${
                          selectedDesign?.id === d.id ? "border-base9-red" : "border-transparent hover:border-base9-gray-300"
                        }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.image_url} alt={d.name} className="w-full aspect-square object-cover bg-base9-gray-100" />
                        <div className="p-2">
                          <p className="text-xs font-medium text-base9-black truncate">{d.name}</p>
                          <p className="text-[10px] text-base9-gray-400">{d.category}</p>
                        </div>
                        {selectedDesign?.id === d.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-base9-red rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {designMode === "upload" && (
              <div className="space-y-4">
                <label className="cursor-pointer block border-2 border-dashed border-base9-gray-300 hover:border-base9-black transition-colors p-10 text-center">
                  <input type="file" accept=".png,.jpg,.jpeg,.ai,.pdf,.svg" className="hidden"
                    onChange={e => setDesignFile(e.target.files?.[0] ?? null)} />
                  {designFile ? (
                    <div className="space-y-2">
                      {designFile.type.startsWith("image/") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(designFile)} alt="preview" className="w-32 h-32 object-contain mx-auto" />
                      )}
                      <p className="text-sm font-medium text-base9-black">{designFile.name}</p>
                      <p className="text-xs text-base9-gray-400">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-10 h-10 text-base9-gray-400 mx-auto" />
                      <p className="text-sm text-base9-gray-500">Drop your design file here or click to browse</p>
                      <p className="text-xs text-base9-gray-300">PNG, JPG, PDF, AI, SVG — Max 20MB</p>
                      <p className="text-xs text-base9-gray-300">High resolution (300dpi+) gives the best print results</p>
                    </div>
                  )}
                </label>
                <div>
                  <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Placement & Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                    className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black resize-none"
                    placeholder="e.g. Centre chest, 20cm wide, white print on black tee..." />
                </div>
              </div>
            )}

            <div className="border-t border-base9-gray-200 pt-4 flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-2 text-xs tracking-ultra-wide uppercase text-base9-gray-500 hover:text-base9-black transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <button type="button" disabled={!canNext2} onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-6 py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-40">
                Next: Confirm <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Contact + Confirm ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">

            {/* Summary */}
            <div className="bg-base9-gray-100 p-4 space-y-2">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-base9-gray-500">{form.garment}</span>
                <span className="text-base9-black">{formatPrice(price)} × {form.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base9-gray-500">Colour / Size</span>
                <span className="text-base9-black">{form.color} / {form.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base9-gray-500">Design</span>
                <span className="text-base9-black">{designMode === "upload" ? designFile?.name ?? "Custom" : selectedDesign?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-base9-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-base9-red">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black" />
              </div>
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Email *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
                  placeholder="+234..." />
              </div>
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
                  placeholder="+234..." />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Delivery Address</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
                className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black resize-none"
                placeholder="Street, City, State..." />
            </div>

            {designMode === "pick" && (
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1.5">Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black resize-none"
                  placeholder="Placement, size of print, special requests..." />
              </div>
            )}

            <p className="text-xs text-base9-gray-400 leading-relaxed">
              After submitting, we&apos;ll contact you via email/WhatsApp within 24hrs to confirm your order and arrange payment.
            </p>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="flex items-center gap-2 text-xs tracking-ultra-wide uppercase text-base9-gray-500 hover:text-base9-black transition-colors">
                <ChevronLeft size={14} /> Back
              </button>
              <button type="submit" disabled={loading || !canSubmit}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-8 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red transition-colors disabled:opacity-40">
                {loading ? "Submitting..." : `Submit Order — ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
