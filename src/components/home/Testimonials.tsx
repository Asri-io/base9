const testimonials = [
  {
    quote:
      "The quality blew me away. Got my custom hoodie in under a week and the print is crisp. Will definitely order again.",
    name: "Jordan M.",
    tag: "@jordanm_style",
  },
  {
    quote:
      "Finally found someone who can match my vision exactly. The back print on my jacket is exactly what I sent them. No guessing.",
    name: "Aisha T.",
    tag: "@aisha.threads",
  },
  {
    quote:
      "Ordered 20 pieces for my team. All consistent, all on time. BASE9 is the real deal for custom work.",
    name: "Chris O.",
    tag: "Brand Manager",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-base9-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-3">
            What They Say
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base9-black">
            Real Orders, Real People
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-base9-white p-8 border border-base9-gray-200 hover:border-base9-gray-400 transition-colors duration-300"
            >
              {/* Quote mark */}
              <div className="text-4xl text-base9-red font-display mb-4 leading-none">
                &ldquo;
              </div>
              <p className="text-sm text-base9-gray-600 leading-relaxed mb-6">
                {t.quote}
              </p>
              <div>
                <p className="text-sm font-semibold text-base9-black">{t.name}</p>
                <p className="text-xs text-base9-gray-400 tracking-wide">{t.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
