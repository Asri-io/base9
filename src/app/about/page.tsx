import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About — BASE9",
  description: "The story behind BASE9 custom clothing.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-4">
              Our Story
            </p>
            <h1 className="text-5xl font-bold text-base9-black mb-6 leading-tight">
              Built for People<br />Who Create
            </h1>
            <div className="space-y-4 text-sm text-base9-gray-500 leading-relaxed">
              <p>
                BASE9 started with a simple idea — that custom clothing shouldn&apos;t feel
                like a compromise. Too many people were settling for average prints on
                average fabric because real quality felt out of reach.
              </p>
              <p>
                We changed that. Every piece we produce is handled by hand, checked for
                quality, and shipped only when we&apos;re proud of it. Your design, your
                vision — executed properly.
              </p>
              <p>
                The &ldquo;9&rdquo; in BASE9 represents the nine steps we take on every
                order — from artwork review to final dispatch — to make sure what you
                receive is exactly what you imagined.
              </p>
            </div>
          </div>

          <div className="bg-base9-gray-100 aspect-square relative overflow-hidden">
            {/* Placeholder — replace with your real photo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-2">
                  <span className="text-6xl font-bold tracking-widest text-base9-black uppercase">BASE</span>
                  <span className="text-6xl font-bold text-base9-red">9</span>
                </div>
                <p className="text-xs tracking-ultra-wide text-base9-gray-400 uppercase">
                  Your Vision — Our Craft
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-base9-gray-200 pt-16">
          {[
            {
              title: "Quality First",
              desc: "We use premium blanks and professional-grade printing. No shortcuts.",
            },
            {
              title: "Made to Order",
              desc: "Nothing sits in a warehouse. Every piece is made fresh for you.",
            },
            {
              title: "Your Design, Exactly",
              desc: "We review every file before printing to make sure your vision is captured.",
            },
          ].map((v) => (
            <div key={v.title}>
              <div className="w-8 h-0.5 bg-base9-red mb-4" />
              <h3 className="text-base font-bold text-base9-black mb-2">{v.title}</h3>
              <p className="text-sm text-base9-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
