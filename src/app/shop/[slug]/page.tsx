import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/shop/ProductDetail";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  // Use placeholder if no DB product yet
  const displayProduct = product ?? {
    id: slug,
    slug,
    name: "Custom Piece",
    price: 85,
    category: "T-Shirts",
    front_image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=90",
    back_image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=90",
    description: "Premium custom clothing piece from BASE9. Made to order with your design.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Gray"],
    is_featured: false,
    is_published: true,
    stock: 99,
    model_url: null,
    created_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-base9-white">
      <Navbar />
      <ProductDetail product={displayProduct} />
      <Footer />
    </main>
  );
}
