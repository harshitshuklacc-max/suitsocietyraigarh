import { notFound } from "next/navigation";
import { getAllCategories, getAllFabrics } from "@/actions/admin";
import { getProductByIdAdmin } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, fabrics] = await Promise.all([
    getProductByIdAdmin(id),
    getAllCategories(),
    getAllFabrics(),
  ]);

  if (!product) notFound();

  return (
    <AdminLayout>
      <ProductForm categories={categories} fabrics={fabrics} product={product} />
    </AdminLayout>
  );
}
