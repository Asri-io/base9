import Link from "next/link";

const STEPS = [
  { n: "01", title: "Pick Your Piece", desc: "Choose your garment — T-shirt or jacket. Select size, colour, and quantity." },
  { n: "02", title: "Choose a Design", desc: "Pick from our design library or upload your own artwork (PNG, AI, PDF)." },
  { n: "03", title: "We Review Your File", desc: "Our team checks resolution, format, and colour accuracy before anything is printed." },
  { n: "04", title: "Print & Finish", desc: "Your piece is printed, heat-cured, and quality-checked by hand." },
  { n: "05", title: "Packed & Shipped", desc: "Carefully packed and dispatched. You're notified when it's on the way." },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-base9-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-600 uppercase mb-3">
              The Process
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-base9-white leading-tight">
              How BASE<span className="text-base9-red">9</span> Works
            </h2>
          </div>
          <Link href="/about"
            className="text-xs tracking-widest uppercase text-base9-gray-500 hover:text-base9-white transition-colors border-b border-base9-gray-700 hover:border-base9-gray-500 pb-0.5 self-start md:self-end">
            See all 9 steps →
          </Link>
        </div>

        {/* Steps — horizontal timeline on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-base9-gray-800 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex lg:flex-col gap-4 lg:gap-0">
                {/* Number bubble */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-base9-gray-800 border border-base9-gray-700 flex items-center justify-center lg:mb-6">
                  <span className="text-base9-red font-bold text-sm">{step.n}</span>
                </div>

                {/* Content */}
                <div className="lg:pt-0">
                  <h3 className="text-sm font-semibold text-base9-white mb-2">{step.title}</h3>
                  <p className="text-xs text-base9-gray-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* Mobile connector */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden absolute left-8 w-px bg-base9-gray-800" style={{ top: `${(i + 1) * 88 - 40}px`, height: "40px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/customize"
            className="inline-flex items-center gap-3 bg-base9-red text-base9-white px-8 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red-dark transition-colors">
            Start Customizing
          </Link>
          <Link href="/bulk-orders"
            className="inline-flex items-center gap-3 border border-base9-gray-700 text-base9-gray-400 px-8 py-4 text-xs tracking-ultra-wide uppercase hover:border-base9-gray-500 hover:text-base9-white transition-colors">
            Bulk Orders →
          </Link>
        </div>
      </div>
    </section>
  );
}
