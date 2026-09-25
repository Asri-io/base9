"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";

const SIZES = {
  "T-Shirts": [
    { size: "XS", chest: "84–88", length: "66", shoulder: "40" },
    { size: "S",  chest: "88–92", length: "68", shoulder: "42" },
    { size: "M",  chest: "96–100", length: "71", shoulder: "44" },
    { size: "L",  chest: "104–108", length: "73", shoulder: "46" },
    { size: "XL", chest: "112–116", length: "76", shoulder: "49" },
    { size: "XXL", chest: "120–124", length: "79", shoulder: "52" },
  ],
  "Jackets": [
    { size: "S",  chest: "92–96", length: "65", shoulder: "43" },
    { size: "M",  chest: "100–104", length: "68", shoulder: "45" },
    { size: "L",  chest: "108–112", length: "71", shoulder: "47" },
    { size: "XL", chest: "116–120", length: "74", shoulder: "50" },
    { size: "XXL", chest: "124–128", length: "77", shoulder: "53" },
  ],
};

type GarmentType = keyof typeof SIZES;

export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState<GarmentType>("T-Shirts");

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-base9-gray-500 hover:text-base9-black transition-colors underline underline-offset-2"
      >
        <Ruler size={12} />
        Size Guide
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setOpen(false)}>
          <div className="bg-base9-white w-full max-w-lg" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-base9-gray-200">
              <h3 className="text-sm font-bold tracking-widest uppercase text-base9-black">Size Guide</h3>
              <button onClick={() => setOpen(false)} className="text-base9-gray-400 hover:text-base9-black">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Type tabs */}
              <div className="flex gap-1 mb-6 bg-base9-gray-100 p-1">
                {(Object.keys(SIZES) as GarmentType[]).map(type => (
                  <button key={type} onClick={() => setActiveType(type)}
                    className={`flex-1 py-2 text-xs tracking-widest uppercase transition-colors ${
                      activeType === type ? "bg-base9-black text-base9-white" : "text-base9-gray-500 hover:text-base9-black"
                    }`}>
                    {type}
                  </button>
                ))}
              </div>

              {/* Measurement note */}
              <p className="text-xs text-base9-gray-400 mb-4 leading-relaxed">
                All measurements in <strong>centimetres (cm)</strong>. Measure your chest at the fullest point.
                If between sizes, go up.
              </p>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-base9-gray-200">
                      {["Size", "Chest", "Length", "Shoulder"].map(h => (
                        <th key={h} className="text-left text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 pb-3 pr-4 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES[activeType].map((row, i) => (
                      <tr key={row.size} className={`border-b border-base9-gray-100 ${i % 2 === 0 ? "" : "bg-base9-gray-100"}`}>
                        <td className="py-3 pr-4 text-sm font-bold text-base9-black">{row.size}</td>
                        <td className="py-3 pr-4 text-sm text-base9-gray-600">{row.chest}</td>
                        <td className="py-3 pr-4 text-sm text-base9-gray-600">{row.length}</td>
                        <td className="py-3 pr-4 text-sm text-base9-gray-600">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-base9-gray-400 mt-4 leading-relaxed">
                Not sure? <a href="/contact" className="text-base9-red hover:underline">Contact us</a> — we&apos;re happy to advise on the best fit.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
