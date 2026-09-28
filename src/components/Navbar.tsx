"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/currency";

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [barVisible, setBarVisible]   = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const { itemCount, totalPrice }     = useCart();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setBarVisible(y < 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bar height is ~40px (py-2.5 + text line). When it hides navbar slides to top-0.
  const navTop = barVisible ? "top-10" : "top-0";

  return (
    <nav
      className={`fixed ${navTop} left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base9-white/95 backdrop-blur-sm border-b border-base9-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className={`text-xl font-bold tracking-widest uppercase transition-colors ${scrolled ? "text-base9-black" : "text-base9-white"}`}>BASE</span>
            <span className="text-xl font-bold text-base9-red">9</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "SHOP",      href: "/shop" },
              { label: "CUSTOMIZE", href: "/customize" },
              { label: "LOOKBOOK",  href: "/lookbook" },
              { label: "ABOUT",     href: "/about" },
              { label: "CONTACT",   href: "/contact" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className={`text-xs tracking-ultra-wide transition-colors duration-200 font-medium ${scrolled ? "text-base9-gray-500 hover:text-base9-black" : "text-base9-gray-400 hover:text-base9-white"}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart */}
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <button className="flex items-center gap-2 bg-base9-black text-base9-white px-4 py-2 rounded-full text-sm font-medium hover:bg-base9-red transition-colors duration-200">
                <ShoppingBag size={14} />
                <span>{formatPrice(totalPrice)}</span>
                {itemCount > 0 && (
                  <span className="bg-base9-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center -ml-1">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-base9-white border-t border-base9-gray-200 px-6 py-6 space-y-4">
          {[
            { label: "SHOP",      href: "/shop" },
            { label: "CUSTOMIZE", href: "/customize" },
            { label: "LOOKBOOK",  href: "/lookbook" },
            { label: "ABOUT",     href: "/about" },
            { label: "CONTACT",   href: "/contact" },
          ].map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block text-xs tracking-ultra-wide text-base9-gray-500 hover:text-base9-black transition-colors py-2 font-medium">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
