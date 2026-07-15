import { getProducts, getCategories, getBrands, getFabrics } from "@/actions/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductFilters } from "@/components/shop/product-filters";
import { ProductFilters as Filters } from "@/types";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: Filters = {
    category: params.category,
    brand: params.brand,
    fabric: params.fabric,
    color: params.color,
    size: params.size,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    inStock: params.inStock === "true",
    sort: (params.sort as Filters["sort"]) || "newest",
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  };

  const [result, categories, brands, fabrics] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
    getFabrics(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl tracking-wider">
          {params.search ? `Search: "${params.search}"` : params.category ? params.category.replace(/-/g, " ").toUpperCase() : "ALL PRODUCTS"}
        </h1>
        <p className="text-muted-foreground mt-2">{result.total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <ProductFilters categories={categories} brands={brands} fabrics={fabrics} currentFilters={filters} />
        </aside>
        <div className="flex-1">
          <ProductGrid products={result.products} total={result.total} currentPage={filters.page || 1} />
        </div>
      </div>
    </div>
  );
}
