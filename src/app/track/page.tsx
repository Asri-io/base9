import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderTracker from "@/components/OrderTracker";

export const metadata = {
  title: "Track Order — BASE9",
  description: "Check the status of your BASE9 custom order.",
};

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-2xl mx-auto">
        <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-3">Order Status</p>
        <h1 className="text-4xl font-bold text-base9-black mb-2">Track Your Order</h1>
        <p className="text-sm text-base9-gray-500 mb-10 leading-relaxed">
          Enter the email address you used when placing your order to see its current status.
        </p>
        <OrderTracker />
      </div>
      <Footer />
    </main>
  );
}
