import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — BASE9",
  description: "The story behind BASE9 and the 9 steps that go into every order.",
};

const NINE_STEPS = [
  { n: "01", title: "Artwork Review", desc: "We check your file for resolution, format, and printability before anything is touched." },
  { n: "02", title: "Garment Selection", desc: "Premium blank selected for your chosen style — weight, fit, and fabric checked." },
  { n: "03", title: "Colour Matching", desc: "We match your design colours to the print medium so what you see is what you get." },
  { n: "04", title: "Print Setup", desc: "Screen preparation or DTG setup — done precisely before a single drop of ink hits fabric." },
  { n: "05", title: "Test Print", desc: "A test run on scrap fabric to verify placement, colour accuracy, and ink adhesion." },
  { n: "06", title: "Production Print", desc: "The real piece gets printed with care — no rushing, no shortcuts." },
  { n: "07", title: "Curing & Finishing", desc: "Ink is heat-cured to lock it permanently. No cracking, no fading after first wash." },
  { n: "08", title: "Quality Check", desc: "Every piece is inspected — print alignment, colour consistency, fabric integrity." },
  { n: "09", title: "Pack & Dispatch", desc: "Carefully folded, sealed, and sent your way. You're notified the moment it ships." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-4">
              Our Story
            </p>
            <h1 className="text-5xl lg:text-6xl font-bold text-base9-black mb-6 leading-tight">
              Built for People<br />Who Create
            </h1>
            <div className="space-y-4 text-sm text-base9-gray-500 leading-relaxed">
              <p>
                BASE9 started with a simple idea — custom clothing shouldn&apos;t feel
                like a compromise. Too many people were settling for average prints on
                average fabric because real quality felt out of reach.
              </p>
              <p>
                We changed that. Every piece we produce is handled by hand, checked for
                quality, and shipped only when we&apos;re proud of it. Your design, your
                vision — executed properly.
              </p>
              <p>
                The <strong className="text-base9-black">&ldquo;9&rdquo;</strong> in BASE9 isn&apos;t random.
                It represents the nine deliberate steps we take on every single order —
                from artwork review to final dispatch — to make sure what you receive
                is exactly what you imagined.
              </p>
            </div>
            <div className="mt-8 flex gap-4">
              <Link href="/customize"
                className="bg-base9-black text-base9-white px-6 py-3 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors">
                Start Your Order
              </Link>
              <Link href="/lookbook"
                className="border border-base9-gray-300 text-base9-black px-6 py-3 text-xs tracking-ultra-wide uppercase hover:border-base9-black transition-colors">
                See Our Work
              </Link>
            </div>
          </div>

          <div className="bg-base9-gray-100 aspect-square relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-3">
                  <span className="text-7xl font-bold tracking-widest text-base9-black uppercase">BASE</span>
                  <span className="text-7xl font-bold text-base9-red">9</span>
                </div>
                <p className="text-xs tracking-ultra-wide text-base9-gray-400 uppercase">
                  Your Vision — Our Craft
                </p>
                {/* Decorative lines */}
                <div className="mt-6 flex gap-2 justify-center">
                  <div className="w-12 h-0.5 bg-base9-red" />
                  <div className="w-4 h-0.5 bg-base9-gray-300" />
                  <div className="w-4 h-0.5 bg-base9-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-base9-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality First", desc: "We use premium blanks and professional-grade printing. No shortcuts, ever." },
            { title: "Made to Order", desc: "Nothing sits in a warehouse. Every piece is made fresh specifically for you." },
            { title: "Your Design, Exactly", desc: "We review every file before printing to make sure your vision is captured." },
          ].map((v) => (
            <div key={v.title}>
              <div className="w-8 h-0.5 bg-base9-red mb-4" />
              <h3 className="text-base font-bold text-base9-black mb-2">{v.title}</h3>
              <p className="text-sm text-base9-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The 9 Steps */}
      <div className="py-24 bg-base9-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-16">
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-600 uppercase mb-3">
              Why BASE<span className="text-base9-red">9</span>
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-base9-white">
              The 9 Steps
            </h2>
            <p className="text-sm text-base9-gray-500 mt-4 max-w-xl leading-relaxed">
              Every order goes through exactly nine steps. No skipping. No rushing.
              This is how we guarantee the result every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {NINE_STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`p-6 border-base9-gray-800 ${
                  i % 3 !== 2 ? "md:border-r" : ""
                } ${i < 6 ? "border-b" : ""}`}
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-bold text-base9-red opacity-50 leading-none">{step.n}</span>
                  <h3 className="text-sm font-semibold text-base9-white">{step.title}</h3>
                </div>
                <p className="text-xs text-base9-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-base9-black mb-4">Ready to create something?</h2>
        <p className="text-sm text-base9-gray-500 mb-8">
          Your design, our craft. Nine steps to perfection.
        </p>
        <Link href="/customize"
          className="inline-flex items-center gap-2 bg-base9-black text-base9-white px-8 py-4 text-xs tracking-ultra-wide uppercase hover:bg-base9-red transition-colors">
          Start Customizing
        </Link>
      </div>

      <Footer />
    </main>
  );
}
