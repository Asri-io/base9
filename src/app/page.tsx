import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const revalidate = 60; // revalidate every 60s so hero updates appear quickly

export default async function Home() {
  const supabase = await createClient();

  // Fetch featured products and hero setting in parallel
  const [{ data: featuredProducts }, { data: settings }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("site_settings")
      .select("key, value"),
  ]);

  // Find which product is set as the hero
  type Setting = { key: string; value: string };
  const settingsList = (settings ?? []) as Setting[];
  const heroId = settingsList.find(s => s.key === "hero_product_id")?.value ?? "";
  const heroLabel = settingsList.find(s => s.key === "hero_label")?.value ?? "Featured Drop";

  let heroProduct: Product | null = null;

  if (heroId) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", heroId)
      .single();
    heroProduct = data;
  }

  // Fall back to first featured product if no hero set
  if (!heroProduct && featuredProducts && featuredProducts.length > 0) {
    heroProduct = featuredProducts[0];
  }

  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <HeroSection product={heroProduct} label={heroLabel} />
      <FeaturedProducts products={featuredProducts ?? []} />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}
