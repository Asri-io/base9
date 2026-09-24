"use client";

import { X, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Database } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface Props {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending:       "bg-yellow-100 text-yellow-700",
  in_production: "bg-blue-100 text-blue-700",
  shipped:       "bg-purple-100 text-purple-700",
  delivered:     "bg-green-100 text-green-700",
};

export default function OrderDetail({ order, onClose, onStatusChange }: Props) {
  const items = Array.isArray(order.items) ? order.items as Record<string, string | number>[] : [];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
      <div className="bg-base9-white w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base9-gray-200 sticky top-0 bg-base9-white z-10">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-base9-black">Order Details</h3>
            <p className="text-[10px] text-base9-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString("en-NG")}</p>
          </div>
          <button onClick={onClose} className="text-base9-gray-400 hover:text-base9-black"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">

          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400">Status</p>
            <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}
              className={`text-xs tracking-wider uppercase border-0 px-3 py-1.5 rounded focus:outline-none cursor-pointer font-medium ${STATUS_COLORS[order.status] || "bg-base9-gray-100 text-base9-gray-500"}`}>
              {["pending", "in_production", "shipped", "delivered"].map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div className="border border-base9-gray-200 p-4 space-y-2">
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Customer</p>
            {[
              { label: "Name",     value: order.customer_name },
              { label: "Email",    value: order.customer_email },
              { label: "Phone",    value: order.customer_phone },
              { label: "WhatsApp", value: order.whatsapp },
              { label: "Address",  value: order.address },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="flex gap-4">
                <span className="text-[10px] tracking-wide uppercase text-base9-gray-400 w-20 shrink-0">{f.label}</span>
                <span className="text-xs text-base9-black">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="border border-base9-gray-200 p-4">
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Items</p>
            {items.length === 0 ? (
              <p className="text-xs text-base9-gray-400">No items</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-base9-gray-100 last:border-0">
                    <span className="text-base9-black font-medium">{String(item.garment || item.name || "Item")}</span>
                    <div className="text-right text-xs text-base9-gray-500 space-x-2">
                      {item.color && <span>{String(item.color)}</span>}
                      {item.size && <span>Size {String(item.size)}</span>}
                      {item.quantity && <span>×{String(item.quantity)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between mt-3 pt-3 border-t border-base9-gray-200">
              <span className="text-xs font-bold text-base9-black uppercase tracking-wide">Total</span>
              <span className="text-sm font-bold text-base9-black">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Design */}
          {(order.custom_design_url || order.selected_design_url) && (
            <div className="border border-base9-gray-200 p-4">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-3">Design</p>
              {order.custom_design_url && (
                <div className="space-y-2">
                  <p className="text-xs text-base9-gray-500">Customer uploaded a custom design:</p>
                  <a href={order.custom_design_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 text-xs tracking-wide uppercase hover:bg-base9-red transition-colors">
                    <ExternalLink size={12} /> Download Design File
                  </a>
                </div>
              )}
              {order.selected_design_url && !order.custom_design_url && (
                <div className="space-y-2">
                  <p className="text-xs text-base9-gray-500">Customer selected from your design library:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.selected_design_url} alt="selected design" className="w-32 h-32 object-contain border border-base9-gray-200" />
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="border border-base9-gray-200 p-4">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-2">Customer Notes</p>
              <p className="text-xs text-base9-gray-600 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
