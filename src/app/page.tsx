import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <HeroSection />
      <FeaturedProducts products={featuredProducts ?? []} />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}
