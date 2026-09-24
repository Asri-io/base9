import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopGrid from "@/components/shop/ShopGrid";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Shop — BASE9",
  description: "Browse the full BASE9 collection. Custom t-shirts, hoodies, and jackets.",
};

export default async function ShopPage() {
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <div className="pt-24 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] tracking-ultra-wide text-base9-gray-400 uppercase mb-2">
            BASE9 Collection
          </p>
          <h1 className="text-4xl font-bold text-base9-black">Shop All</h1>
        </div>
        <ShopGrid products={products ?? []} />
      </div>
      <Footer />
    </main>
  );
}
