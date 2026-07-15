export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/footer";
import { getCategories } from "@/actions/products";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
