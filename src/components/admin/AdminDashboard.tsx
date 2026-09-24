"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Package, ShoppingBag, Settings, LogOut, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { Database } from "@/types/database";
import ProductForm from "./ProductForm";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

type Tab = "products" | "orders" | "settings";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, ordRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts(prodRes.data ?? []);
    setOrders(ordRes.data ?? []);
    setLoading(false);
  };

  const togglePublish = async (product: Product) => {
    await supabase
      .from("products")
      .update({ is_published: !product.is_published })
      .eq("id", product.id);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-base9-gray-100">
      {/* Top bar */}
      <div className="bg-base9-black px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold tracking-widest text-base9-white uppercase">BASE</span>
          <span className="text-xl font-bold text-base9-red">9</span>
          <span className="text-xs text-base9-gray-500 ml-3 tracking-widest uppercase">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-base9-gray-500 hover:text-base9-white transition-colors"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products.length, icon: Package },
            { label: "Published", value: products.filter((p) => p.is_published).length, icon: Eye },
            { label: "Total Orders", value: orders.length, icon: ShoppingBag },
            { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Settings },
          ].map((stat) => (
            <div key={stat.label} className="bg-base9-white p-6 border border-base9-gray-200">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-base9-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-base9-white border border-base9-gray-200 p-1 w-fit">
          {(["products", "orders", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-xs tracking-widest uppercase transition-colors ${
                tab === t
                  ? "bg-base9-black text-base9-white"
                  : "text-base9-gray-500 hover:text-base9-black"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-base9-black">Products</h2>
              <button
                onClick={() => { setEditProduct(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-base9-red transition-colors"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-base9-gray-400">Loading...</p>
            ) : products.length === 0 ? (
              <div className="bg-base9-white border border-base9-gray-200 p-12 text-center">
                <p className="text-sm text-base9-gray-400 mb-4">No products yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-base9-red transition-colors"
                >
                  <Plus size={14} /> Add First Product
                </button>
              </div>
            ) : (
              <div className="bg-base9-white border border-base9-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base9-gray-200">
                      {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-base9-gray-100 hover:bg-base9-gray-100 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-base9-black">{p.name}</td>
                        <td className="px-4 py-4 text-xs text-base9-gray-500">{p.category}</td>
                        <td className="px-4 py-4 text-sm text-base9-black">${p.price}</td>
                        <td className="px-4 py-4 text-sm text-base9-gray-500">{p.stock}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] tracking-wider uppercase px-2 py-1 ${
                            p.is_published
                              ? "bg-green-100 text-green-700"
                              : "bg-base9-gray-200 text-base9-gray-500"
                          }`}>
                            {p.is_published ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePublish(p)}
                              className="text-base9-gray-400 hover:text-base9-black transition-colors"
                              title={p.is_published ? "Unpublish" : "Publish"}
                            >
                              {p.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => { setEditProduct(p); setShowForm(true); }}
                              className="text-base9-gray-400 hover:text-base9-black transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="text-base9-gray-400 hover:text-base9-red transition-colors"
                              title="Delete"
                            >
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

        {/* Orders tab */}
        {tab === "orders" && (
          <div>
            <h2 className="text-lg font-bold text-base9-black mb-6">Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-base9-white border border-base9-gray-200 p-12 text-center">
                <p className="text-sm text-base9-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="bg-base9-white border border-base9-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base9-gray-200">
                      {["Customer", "Email", "Total", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-base9-gray-100 hover:bg-base9-gray-100 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-base9-black">{o.customer_name}</td>
                        <td className="px-4 py-4 text-xs text-base9-gray-500">{o.customer_email}</td>
                        <td className="px-4 py-4 text-sm text-base9-black">${o.total}</td>
                        <td className="px-4 py-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="text-[10px] tracking-wider uppercase border border-base9-gray-300 px-2 py-1 bg-base9-white focus:outline-none focus:border-base9-black"
                          >
                            {["pending", "in_production", "shipped", "delivered"].map((s) => (
                              <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-xs text-base9-gray-400">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <a href={`/admin/orders/${o.id}`} className="text-xs text-base9-red hover:underline">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {tab === "settings" && (
          <div className="bg-base9-white border border-base9-gray-200 p-8 max-w-lg">
            <h2 className="text-lg font-bold text-base9-black mb-6">Settings</h2>
            <p className="text-sm text-base9-gray-400">
              Site settings and configuration will appear here. Coming soon.
            </p>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchData(); }}
        />
      )}
    </div>
  );
}
