import { getAllCategories, getAllFabrics } from "@/actions/admin";
import { ProductForm } from "@/components/admin/product-form";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default async function NewProductPage() {
  const [categories, fabrics] = await Promise.all([
    getAllCategories(),
    getAllFabrics(),
  ]);

  return (
    <AdminLayout>
    <div>
      <h1 className="text-2xl font-serif tracking-wider mb-6 text-white">Add New Product</h1>
      <ProductForm categories={categories} fabrics={fabrics} />
    </div>
    </AdminLayout>
  );
}
