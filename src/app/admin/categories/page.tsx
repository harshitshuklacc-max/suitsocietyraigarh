import { getAllCategories } from "@/actions/admin";
import { CategoryManager } from "@/components/admin/category-manager";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return (
    <AdminLayout>
    <div>
      <h1 className="text-2xl font-serif tracking-wider mb-6 text-white">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
    </AdminLayout>
  );
}