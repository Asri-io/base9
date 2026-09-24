import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomizeForm from "@/components/customize/CustomizeForm";

export const metadata = {
  title: "Customize — BASE9",
  description: "Submit your custom design order. Upload your artwork and we'll bring it to life.",
};

export default function CustomizePage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-24 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-3">
            Custom Orders
          </p>
          <h1 className="text-4xl font-bold text-base9-black mb-4">Customize Yours</h1>
          <p className="text-sm text-base9-gray-500 leading-relaxed mb-12">
            Send us your design and we&apos;ll map it onto your chosen garment. Fill in the
            details below and we&apos;ll get back to you within 24 hours with a quote and
            timeline.
          </p>
          <CustomizeForm />
        </div>
      </div>
      <Footer />
    </main>
  );
}
