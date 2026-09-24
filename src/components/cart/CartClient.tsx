"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

export default function CartClient() {
  const { cart, removeItem, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-base9-gray-400 text-sm mb-6">Your cart is empty</p>
        <Link href="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-base9-black border-b border-base9-black pb-0.5 hover:text-base9-red hover:border-base9-red transition-colors">
          Browse Products <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  const freeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const grandTotal   = totalPrice + (freeShipping ? 0 : SHIPPING_FEE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Items */}
      <div className="lg:col-span-2 space-y-6">
        {cart.map(item => (
          <div key={`${item.id}-${item.size}-${item.color}`}
            className="flex gap-6 pb-6 border-b border-base9-gray-200">
            <div className="relative w-24 h-32 bg-base9-gray-100 shrink-0">
              <Image
                src={item.image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&q=80"}
                alt={item.name} fill className="object-cover" sizes="96px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-base9-black">{item.name}</h3>
                  <p className="text-xs text-base9-gray-400 mt-1">{item.color} · Size {item.size}</p>
                </div>
                <p className="text-sm font-medium text-base9-black shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 border border-base9-gray-300">
                  <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                    className="p-2 hover:bg-base9-gray-100 transition-colors" aria-label="Decrease">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                    className="p-2 hover:bg-base9-gray-100 transition-colors" aria-label="Increase">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => removeItem(item.id, item.size, item.color)}
                  className="text-base9-gray-400 hover:text-base9-red transition-colors" aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-base9-gray-100 p-6 sticky top-24">
          <h2 className="text-sm font-bold text-base9-black mb-6 tracking-widest uppercase">Order Summary</h2>
          <div className="space-y-3 mb-6 pb-6 border-b border-base9-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-base9-gray-500">Subtotal</span>
              <span className="text-base9-black">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-base9-gray-500">Delivery</span>
              <span className="text-base9-black">{freeShipping ? "Free" : formatPrice(SHIPPING_FEE)}</span>
            </div>
            {!freeShipping && (
              <p className="text-xs text-base9-gray-400">
                Add {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} more for free delivery
              </p>
            )}
          </div>
          <div className="flex justify-between text-base mb-6">
            <span className="font-bold text-base9-black">Total</span>
            <span className="font-bold text-base9-black">{formatPrice(grandTotal)}</span>
          </div>
          <Link href="/customize"
            className="block w-full text-center bg-base9-black text-base9-white py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red transition-colors mb-3">
            Checkout
          </Link>
          <Link href="/shop"
            className="block w-full text-center border border-base9-gray-300 text-base9-gray-500 py-3 text-xs tracking-widest uppercase hover:border-base9-black hover:text-base9-black transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
