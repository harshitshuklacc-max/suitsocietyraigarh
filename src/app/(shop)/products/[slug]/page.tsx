import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/actions/products";
import { getProductReviews } from "@/actions/auth";
import { ProductDetail } from "@/components/shop/product-detail";
import { ProductCard } from "@/components/shop/product-card";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    product.category_id
      ? getProducts({ category: product.category?.slug, limit: 4 })
      : Promise.resolve({ products: [], total: 0 }),
  ]);

  const relatedProducts = related.products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div>
      <ProductDetail product={product} />

      {reviews.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t">
          <h2 className="font-serif text-2xl tracking-wider mb-6">CUSTOMER REVIEWS</h2>
          <div className="space-y-4 max-w-2xl">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{review.user?.full_name || "Customer"}</span>
                  <span className="text-gold text-sm">{"★".repeat(review.rating)}</span>
                </div>
                {review.title && <p className="font-medium text-sm">{review.title}</p>}
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-serif text-2xl tracking-wider mb-6">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
