export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Pick Your Piece",
      description:
        "Choose from our range of premium blanks — t-shirts, hoodies, jackets. Select your size and color.",
    },
    {
      number: "02",
      title: "Send Your Design",
      description:
        "Upload your artwork or describe what you want. We accept PNG, AI, PDF. High-res = best results.",
    },
    {
      number: "03",
      title: "We Print & Ship",
      description:
        "We handle the printing, customization, and quality check. Your piece ships within 5–7 business days.",
    },
  ];

  return (
    <section className="py-24 bg-base9-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-500 uppercase mb-3">
            The Process
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base9-white">
            How BASE9 Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-px bg-base9-gray-700 -translate-y-0.5 z-0" />
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-bold text-base9-red opacity-40 font-display leading-none">
                    {step.number}
                  </span>
                  <div className="flex-1 h-px bg-base9-gray-700" />
                </div>

                <h3 className="text-lg font-semibold text-base9-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-base9-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/customize"
            className="inline-flex items-center gap-3 bg-base9-red text-base9-white px-8 py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red-dark transition-colors duration-300"
          >
            Start Customizing
          </a>
        </div>
      </div>
    </section>
  );
}
