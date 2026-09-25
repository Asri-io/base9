"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import {
  Plus, Package, ShoppingBag, LogOut, Edit,
  Trash2, Eye, EyeOff, Image, ExternalLink,
} from "lucide-react";
import type { Database } from "@/types/database";
import ProductForm from "./ProductForm";
import DesignForm from "./DesignForm";
import OrderDetail from "./OrderDetail";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order   = Database["public"]["Tables"]["orders"]["Row"];
type Design  = Database["public"]["Tables"]["designs"]["Row"];
type Tab = "products" | "designs" | "orders" | "settings";

export default function AdminDashboard() {
  const [tab, setTab]             = useState<Tab>("products");
  const [products, setProducts]   = useState<Product[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [designs, setDesigns]     = useState<Design[]>([]);
  const [heroProductId, setHeroProductId] = useState("");
  const [heroLabel, setHeroLabel]         = useState("Featured Drop");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDesignForm, setShowDesignForm]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editDesign, setEditDesign]   = useState<Design | null>(null);
  const [viewOrder, setViewOrder]     = useState<Order | null>(null);
  const [loading, setLoading]         = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, ordRes, desRes, setRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("designs").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("key, value"),
    ]);
    setProducts(prodRes.data ?? []);
    setOrders(ordRes.data ?? []);
    setDesigns(desRes.data ?? []);
    const heroId = setRes.data?.find(s => s.key === "hero_product_id")?.value ?? "";
    const label  = setRes.data?.find(s => s.key === "hero_label")?.value ?? "Featured Drop";
    setHeroProductId(heroId);
    setHeroLabel(label);
    setLoading(false);
  };

  const saveHeroSettings = async () => {
    await Promise.all([
      fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "hero_product_id", value: heroProductId }) }),
      fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "hero_label", value: heroLabel }) }),
    ]);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const togglePublish = async (p: Product) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_published: !p.is_published }),
    });
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const toggleDesignActive = async (d: Design) => {
    await fetch("/api/admin/designs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, is_active: !d.is_active }),
    });
    fetchData();
  };

  const deleteDesign = async (id: string) => {
    if (!confirm("Delete this design?")) return;
    await fetch("/api/admin/designs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  const STATUS_COLORS: Record<string, string> = {
    pending:       "bg-yellow-100 text-yellow-700",
    in_production: "bg-blue-100 text-blue-700",
    shipped:       "bg-purple-100 text-purple-700",
    delivered:     "bg-green-100 text-green-700",
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "products", label: "Products", count: products.length },
    { key: "designs",  label: "Designs",  count: designs.length },
    { key: "orders",   label: "Orders",   count: orders.filter(o => o.status === "pending").length },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-base9-gray-100">

      {/* Top bar */}
      <div className="bg-base9-black px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-widest text-base9-white uppercase">BASE</span>
          <span className="text-xl font-bold text-base9-red">9</span>
          <span className="text-xs text-base9-gray-500 ml-3 tracking-widest uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="flex items-center gap-1.5 text-xs text-base9-gray-500 hover:text-base9-white transition-colors">
            <ExternalLink size={12} /> View Site
          </a>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-base9-gray-500 hover:text-base9-white transition-colors">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Products",       value: products.length },
            { label: "Designs",        value: designs.filter(d => d.is_active).length },
            { label: "Total Orders",   value: orders.length },
            { label: "Pending Orders", value: orders.filter(o => o.status === "pending").length },
          ].map(s => (
            <div key={s.label} className="bg-base9-white p-6 border border-base9-gray-200">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-base9-black">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 bg-base9-white border border-base9-gray-200 p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-xs tracking-widest uppercase transition-colors flex items-center gap-1.5 ${
                tab === t.key ? "bg-base9-black text-base9-white" : "text-base9-gray-500 hover:text-base9-black"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center ${
                  tab === t.key ? "bg-base9-red text-white" : "bg-base9-gray-200 text-base9-gray-600"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-base9-black">Products</h2>
              <button onClick={() => { setEditProduct(null); setShowProductForm(true); }}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-base9-red transition-colors">
                <Plus size={14} /> Add Product
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-base9-gray-400 animate-pulse">Loading...</p>
            ) : products.length === 0 ? (
              <EmptyState label="No products yet" onAdd={() => setShowProductForm(true)} addLabel="Add First Product" />
            ) : (
              <div className="bg-base9-white border border-base9-gray-200 overflow-x-auto rounded-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base9-gray-200">
                      {["Product", "Category", "Price (₦)", "Stock", "Featured", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-base9-gray-100 hover:bg-base9-gray-100 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {p.front_image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.front_image} alt={p.name} className="w-10 h-12 object-cover bg-base9-gray-100" />
                            )}
                            <span className="text-sm font-medium text-base9-black">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-base9-gray-500">{p.category}</td>
                        <td className="px-4 py-4 text-sm text-base9-black font-medium">{formatPrice(p.price)}</td>
                        <td className="px-4 py-4 text-sm text-base9-gray-500">{p.stock}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[9px] tracking-wider uppercase px-2 py-1 ${p.is_featured ? "bg-yellow-100 text-yellow-700" : "bg-base9-gray-100 text-base9-gray-400"}`}>
                            {p.is_featured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[9px] tracking-wider uppercase px-2 py-1 ${p.is_published ? "bg-green-100 text-green-700" : "bg-base9-gray-200 text-base9-gray-500"}`}>
                            {p.is_published ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => togglePublish(p)} title={p.is_published ? "Unpublish" : "Publish"}
                              className="text-base9-gray-400 hover:text-base9-black transition-colors">
                              {p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => { setEditProduct(p); setShowProductForm(true); }} title="Edit"
                              className="text-base9-gray-400 hover:text-base9-black transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} title="Delete"
                              className="text-base9-gray-400 hover:text-base9-red transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DESIGNS TAB ── */}
        {tab === "designs" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-base9-black">Design Library</h2>
                <p className="text-xs text-base9-gray-400 mt-0.5">Customers pick from these on the customize page</p>
              </div>
              <button onClick={() => { setEditDesign(null); setShowDesignForm(true); }}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-base9-red transition-colors">
                <Plus size={14} /> Upload Design
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-base9-gray-400 animate-pulse mt-6">Loading...</p>
            ) : designs.length === 0 ? (
              <EmptyState label="No designs yet. Upload your first design." onAdd={() => setShowDesignForm(true)} addLabel="Upload Design" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {designs.map(d => (
                  <div key={d.id} className={`bg-base9-white border group relative ${d.is_active ? "border-base9-gray-200" : "border-base9-gray-200 opacity-50"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.image_url} alt={d.name} className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="text-xs font-medium text-base9-black truncate">{d.name}</p>
                      <p className="text-[10px] text-base9-gray-400 mt-0.5">{d.category}</p>
                    </div>
                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleDesignActive(d)} title={d.is_active ? "Deactivate" : "Activate"}
                        className="bg-base9-white/90 p-1.5 rounded-full hover:bg-base9-black hover:text-white transition-colors">
                        {d.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => { setEditDesign(d); setShowDesignForm(true); }} title="Edit"
                        className="bg-base9-white/90 p-1.5 rounded-full hover:bg-base9-black hover:text-white transition-colors">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => deleteDesign(d.id)} title="Delete"
                        className="bg-base9-white/90 p-1.5 rounded-full hover:bg-base9-red hover:text-white transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {!d.is_active && (
                      <div className="absolute top-2 left-2 bg-base9-gray-700/80 text-white text-[9px] tracking-wider px-2 py-0.5 uppercase">
                        Hidden
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-base9-black">Orders</h2>
              <p className="text-xs text-base9-gray-400">{orders.filter(o => o.status === "pending").length} pending</p>
            </div>

            {orders.length === 0 ? (
              <EmptyState label="No orders yet" />
            ) : (
              <div className="bg-base9-white border border-base9-gray-200 overflow-x-auto rounded-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base9-gray-200">
                      {["#", "Customer", "Contact", "Items", "Total", "Design", "Status", "Date", ""].map(h => (
                        <th key={h} className="text-left text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={o.id} className="border-b border-base9-gray-100 hover:bg-base9-gray-100 transition-colors">
                        <td className="px-4 py-4 text-xs text-base9-gray-400">#{orders.length - i}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-base9-black">{o.customer_name}</p>
                          {o.whatsapp && <p className="text-[10px] text-base9-gray-400">{o.whatsapp}</p>}
                        </td>
                        <td className="px-4 py-4 text-xs text-base9-gray-500">{o.customer_email}</td>
                        <td className="px-4 py-4 text-xs text-base9-gray-500">
                          {Array.isArray(o.items) ? (o.items as {garment?: string; name?: string}[]).map(it => it.garment || it.name || "Item").join(", ") : "—"}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-base9-black">{formatPrice(o.total)}</td>
                        <td className="px-4 py-4">
                          {o.custom_design_url ? (
                            <a href={o.custom_design_url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-base9-red hover:underline flex items-center gap-1">
                              <Image size={10} /> Custom
                            </a>
                          ) : o.selected_design_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={o.selected_design_url} alt="design" className="w-8 h-8 object-cover" />
                          ) : (
                            <span className="text-[10px] text-base9-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`text-[10px] tracking-wider uppercase border-0 px-2 py-1 rounded focus:outline-none cursor-pointer ${STATUS_COLORS[o.status] || "bg-base9-gray-100 text-base9-gray-500"}`}>
                            {["pending", "in_production", "shipped", "delivered"].map(s => (
                              <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-xs text-base9-gray-400 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString("en-NG")}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => setViewOrder(o)}
                            className="text-xs text-base9-red hover:underline whitespace-nowrap">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="text-lg font-bold text-base9-black mb-1">Homepage Hero</h2>
              <p className="text-xs text-base9-gray-400 mb-6">
                Choose which product appears in the main hero section on the homepage.
                The product&apos;s front and back images, name, and price will show automatically.
              </p>
            </div>

            {/* Hero product picker */}
            <div className="bg-base9-white border border-base9-gray-200 p-6 space-y-5">
              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">
                  Section Label (shown above the product name)
                </label>
                <input
                  type="text"
                  value={heroLabel}
                  onChange={e => setHeroLabel(e.target.value)}
                  className="w-full border border-base9-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-base9-black"
                  placeholder="e.g. Featured Drop, New Arrival, Best Seller"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">
                  Hero Product
                </label>
                {products.filter(p => p.is_published).length === 0 ? (
                  <p className="text-xs text-base9-gray-400 py-3">
                    No published products yet. Add and publish a product first.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* None option */}
                    <button
                      type="button"
                      onClick={() => setHeroProductId("")}
                      className={`border p-3 text-left transition-all ${
                        heroProductId === ""
                          ? "border-base9-black bg-base9-black text-base9-white"
                          : "border-base9-gray-200 hover:border-base9-gray-400"
                      }`}
                    >
                      <p className="text-xs font-medium">Default</p>
                      <p className={`text-[10px] mt-0.5 ${heroProductId === "" ? "text-base9-gray-300" : "text-base9-gray-400"}`}>
                        Use hardcoded fallback
                      </p>
                    </button>

                    {products.filter(p => p.is_published).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setHeroProductId(p.id)}
                        className={`border relative text-left transition-all overflow-hidden ${
                          heroProductId === p.id
                            ? "border-base9-red"
                            : "border-base9-gray-200 hover:border-base9-gray-400"
                        }`}
                      >
                        {p.front_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.front_image} alt={p.name} className="w-full h-24 object-cover" />
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium text-base9-black truncate">{p.name}</p>
                          <p className="text-[10px] text-base9-gray-400">{formatPrice(p.price)}</p>
                        </div>
                        {heroProductId === p.id && (
                          <div className="absolute top-2 right-2 bg-base9-red text-white text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                            Hero
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview of selected */}
              {heroProductId && products.find(p => p.id === heroProductId) && (() => {
                const p = products.find(p => p.id === heroProductId)!;
                return (
                  <div className="border border-base9-gray-200 p-4 bg-base9-gray-100">
                    <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Preview</p>
                    <div className="flex gap-4 items-center">
                      {p.front_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.front_image} alt={p.name} className="w-16 h-20 object-cover" />
                      )}
                      <div>
                        <p className="text-[10px] text-base9-gray-400 uppercase tracking-widest">{heroLabel}</p>
                        <p className="text-base font-bold text-base9-black mt-1">{p.name}</p>
                        <p className="text-sm text-base9-gray-500 mt-0.5">{formatPrice(p.price)}</p>
                        <p className="text-xs text-base9-gray-400 mt-1">
                          Front image: {p.front_image ? "✓" : "✗ missing"} · Back image: {p.back_image ? "✓" : "✗ missing"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={saveHeroSettings}
                className="bg-base9-black text-base9-white px-6 py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors"
              >
                {settingsSaved ? "✓ Saved!" : "Save Hero Settings"}
              </button>
            </div>

            {/* Other settings */}
            <div className="bg-base9-white border border-base9-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-base9-black">Other Settings</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-base9-black">Custom Domain</p>
                    <p className="text-xs text-base9-gray-400 mt-0.5 leading-relaxed">
                      Buy <strong>base9.com.ng</strong> or <strong>base9.co</strong>, then add it in{" "}
                      <a href="https://vercel.com/asri-ios-projects/base9-store/settings/domains" target="_blank" className="text-base9-red hover:underline">
                        Vercel → Domains
                      </a>
                    </p>
                  </div>
                </div>
                <div className="border-t border-base9-gray-200 pt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-base9-black">Change Admin Password</p>
                    <p className="text-xs text-base9-gray-400 mt-0.5">
                      Update <code>ADMIN_PASSWORD</code> in{" "}
                      <a href="https://vercel.com/asri-ios-projects/base9-store/settings/environment-variables" target="_blank" className="text-base9-red hover:underline">
                        Vercel → Environment Variables
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm product={editProduct} onClose={() => setShowProductForm(false)} onSave={() => { setShowProductForm(false); fetchData(); }} />
      )}
      {showDesignForm && (
        <DesignForm design={editDesign} onClose={() => setShowDesignForm(false)} onSave={() => { setShowDesignForm(false); fetchData(); }} />
      )}
      {viewOrder && (
        <OrderDetail order={viewOrder} onClose={() => setViewOrder(null)} onStatusChange={updateOrderStatus} />
      )}
    </div>
  );
}

function EmptyState({ label, onAdd, addLabel }: { label: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="bg-base9-white border border-base9-gray-200 p-16 text-center mt-4">
      <Package size={32} className="mx-auto text-base9-gray-300 mb-4" />
      <p className="text-sm text-base9-gray-400 mb-4">{label}</p>
      {onAdd && (
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-base9-red transition-colors">
          <Plus size={14} /> {addLabel}
        </button>
      )}
    </div>
  );
}
