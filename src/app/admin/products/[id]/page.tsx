import { notFound } from "next/navigation";
import { getAllCategories, getAllFabrics } from "@/actions/admin";
import { getProductByIdAdmin } from "@/actions/products";
import { getManagedCatalogSizes } from "@/lib/catalog-sizes";
import { ProductForm } from "@/components/admin/product-form";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, fabrics, availableSizes] = await Promise.all([
    getProductByIdAdmin(id),
    getAllCategories(),
    getAllFabrics(),
    getManagedCatalogSizes(),
  ]);

  if (!product) notFound();

  return (
    <AdminLayout>
      <ProductForm
        categories={categories}
        fabrics={fabrics}
        product={product}
        availableSizes={availableSizes}
      />
    </AdminLayout>
  );
}
