import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartClient from "@/components/cart/CartClient";

export const metadata = {
  title: "Cart — BASE9",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-24 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-2">
            Your Selection
          </p>
          <h1 className="text-4xl font-bold text-base9-black">Cart</h1>
        </div>
        <CartClient />
      </div>
      <Footer />
    </main>
  );
}
