import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BulkOrderForm from "@/components/BulkOrderForm";

export const metadata = {
  title: "Bulk Orders — BASE9",
  description: "Ordering 5+ pieces? Get special pricing for teams, events, and brands.",
};

export default function BulkOrdersPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left — info */}
          <div>
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-4">
              For Teams & Brands
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-base9-black mb-6 leading-tight">
              Bulk Orders
            </h1>
            <p className="text-sm text-base9-gray-500 leading-relaxed mb-10">
              Ordering 5 or more pieces? We offer dedicated pricing for teams, events,
              brands, and organisations. Tell us what you need and we&apos;ll get back
              to you within 24 hours with a full quote.
            </p>

            {/* Benefits */}
            <div className="space-y-5 mb-10">
              {[
                { title: "Better Pricing", desc: "The more you order, the better the unit price. Starting from 5 pieces." },
                { title: "Consistent Quality", desc: "Every piece in your run is checked to the same standard — no variance." },
                { title: "Deadline Focused", desc: "Tell us your event date and we build the timeline backwards to deliver on time." },
                { title: "Mixed Garments", desc: "Mix tees, jackets, and other pieces in a single order — one quote, one delivery." },
              ].map(b => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-0.5 h-full bg-base9-red flex-shrink-0 self-stretch" />
                  <div>
                    <p className="text-sm font-semibold text-base9-black">{b.title}</p>
                    <p className="text-xs text-base9-gray-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price tiers */}
            <div className="bg-base9-gray-100 p-6">
              <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-4">Pricing Tiers</p>
              <div className="space-y-3">
                {[
                  { range: "5–9 pieces", discount: "5% off", color: "text-base9-gray-500" },
                  { range: "10–24 pieces", discount: "10% off", color: "text-base9-gray-600" },
                  { range: "25–49 pieces", discount: "15% off", color: "text-base9-black" },
                  { range: "50+ pieces", discount: "Custom Quote", color: "text-base9-red font-semibold" },
                ].map(t => (
                  <div key={t.range} className="flex justify-between items-center py-2 border-b border-base9-gray-200 last:border-0">
                    <span className="text-xs text-base9-gray-600">{t.range}</span>
                    <span className={`text-xs ${t.color}`}>{t.discount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <BulkOrderForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
