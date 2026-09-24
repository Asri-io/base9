import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact — BASE9",
  description: "Get in touch with the BASE9 team.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl font-bold text-base9-black mb-6">Contact BASE9</h1>
            <p className="text-sm text-base9-gray-500 leading-relaxed mb-10">
              Have a question about an order, want to discuss a bulk project, or just want
              to say hi? We reply to every message within 24 hours.
            </p>

            <div className="space-y-6">
              {[
                { label: "Email", value: "hello@base9.co" },
                { label: "Instagram", value: "@base9.clothing" },
                { label: "Response Time", value: "Within 24 hours" },
                { label: "Bulk Orders", value: "10+ pieces = special pricing" },
              ].map((item) => (
                <div key={item.label} className="border-b border-base9-gray-200 pb-4">
                  <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-base9-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — redirect to customize for orders */}
          <div className="bg-base9-gray-100 p-10">
            <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-400 mb-6">
              Quick Actions
            </p>
            <div className="space-y-4">
              <a
                href="/customize"
                className="block w-full text-center bg-base9-black text-base9-white py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red transition-colors"
              >
                Submit Custom Order
              </a>
              <a
                href="mailto:hello@base9.co"
                className="block w-full text-center border border-base9-black text-base9-black py-4 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-black hover:text-base9-white transition-colors"
              >
                Email Us Directly
              </a>
            </div>

            <div className="mt-10 p-6 bg-base9-white border border-base9-gray-200">
              <p className="text-xs font-bold text-base9-black mb-2">Bulk Orders</p>
              <p className="text-xs text-base9-gray-500 leading-relaxed">
                Ordering 10 or more pieces? We offer custom pricing for teams, events,
                and brands. Email us with your requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
