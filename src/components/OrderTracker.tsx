"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/currency";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import type { Database } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const STATUS_STEPS = ["pending", "in_production", "shipped", "delivered"];

const STATUS_INFO: Record<string, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  pending:       { label: "Order Received",   desc: "We've got your order and will start processing shortly.", icon: Clock,        color: "text-yellow-600" },
  in_production: { label: "In Production",    desc: "Your piece is being printed and customized.",            icon: Package,       color: "text-blue-600"   },
  shipped:       { label: "Shipped",           desc: "Your order is on its way to you.",                      icon: Truck,         color: "text-purple-600" },
  delivered:     { label: "Delivered",         desc: "Your order has been delivered. Enjoy!",                 icon: CheckCircle,   color: "text-green-600"  },
};

export default function OrderTracker() {
  const supabase = createClient();
  const [email, setEmail]     = useState("");
  const [orders, setOrders]   = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(false);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email.toLowerCase().trim())
      .order("created_at", { ascending: false });

    setOrders(data ?? []);
    setLoading(false);
    setSearched(true);
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 border border-base9-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-base9-black"
        />
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-base9-black text-base9-white px-6 py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors disabled:opacity-50">
          <Search size={14} />
          {loading ? "..." : "Find"}
        </button>
      </form>

      {/* Results */}
      {searched && orders !== null && (
        orders.length === 0 ? (
          <div className="text-center py-12 border border-base9-gray-200">
            <Package size={32} className="mx-auto text-base9-gray-300 mb-3" />
            <p className="text-sm font-medium text-base9-black mb-1">No orders found</p>
            <p className="text-xs text-base9-gray-400">
              Check the email address, or{" "}
              <a href="/contact" className="text-base9-red hover:underline">contact us</a> if you need help.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const stepIndex  = STATUS_STEPS.indexOf(order.status);
              const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.pending;
              const StatusIcon = statusInfo.icon;
              const items      = Array.isArray(order.items)
                ? (order.items as Record<string, string | number>[])
                : [];

              return (
                <div key={order.id} className="border border-base9-gray-200 overflow-hidden">
                  {/* Order header */}
                  <div className="bg-base9-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400">
                        Order #{orders.length - idx}
                      </p>
                      <p className="text-xs text-base9-gray-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-base9-black">{formatPrice(order.total)}</p>
                  </div>

                  <div className="px-6 py-6 space-y-6">
                    {/* Current status */}
                    <div className="flex items-start gap-4">
                      <StatusIcon size={24} className={`${statusInfo.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-sm font-bold text-base9-black">{statusInfo.label}</p>
                        <p className="text-xs text-base9-gray-500 mt-0.5">{statusInfo.desc}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                              i <= stepIndex
                                ? "bg-base9-black border-base9-black"
                                : "bg-white border-base9-gray-300"
                            }`} />
                            <p className={`text-[9px] mt-1.5 tracking-wide uppercase text-center leading-tight hidden sm:block ${
                              i <= stepIndex ? "text-base9-black font-medium" : "text-base9-gray-400"
                            }`}>
                              {STATUS_INFO[step].label}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Connecting line */}
                      <div className="relative h-0.5 bg-base9-gray-200 -mt-8 mx-1.5 z-0">
                        <div
                          className="absolute left-0 top-0 h-full bg-base9-black transition-all duration-500"
                          style={{ width: `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Items */}
                    {items.length > 0 && (
                      <div className="border-t border-base9-gray-200 pt-4">
                        <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Items</p>
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5">
                            <span className="text-base9-black">{String(item.garment || item.name || "Custom Item")}</span>
                            <span className="text-base9-gray-400">
                              {item.color && `${item.color} · `}
                              {item.size && `Size ${item.size} · `}
                              ×{item.quantity ?? 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Help */}
                    <p className="text-xs text-base9-gray-400">
                      Questions?{" "}
                      <a href="/contact" className="text-base9-red hover:underline">Contact us</a>
                      {" "}or WhatsApp us directly.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
