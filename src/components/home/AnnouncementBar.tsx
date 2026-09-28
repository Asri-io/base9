"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  text?: string;
  link?: string;
  enabled?: boolean;
}

export default function AnnouncementBar({
  text = "Bulk orders available now · 5+ pieces get special pricing",
  link = "/bulk-orders",
  enabled = true,
}: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] bg-base9-red text-base9-white py-2.5 px-6 text-center transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <p className="text-xs tracking-widest uppercase">
        <Link
          href={link}
          className="hover:opacity-80 transition-opacity"
        >
          {text}
        </Link>
      </p>
    </div>
  );
}
