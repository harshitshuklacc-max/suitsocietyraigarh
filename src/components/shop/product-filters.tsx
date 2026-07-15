"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category, Brand, Fabric, ProductFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface Props {
  categories: Category[];
  brands: Brand[];
  fabrics: Fabric[];
  currentFilters: ProductFilters;
}

export function ProductFilters({ categories, brands, fabrics, currentFilters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => router.push("/products");

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "discount", label: "Discount" },
    { value: "best_selling", label: "Best Selling" },
  ];

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden flex items-center gap-2 mb-4 text-sm">
        <SlidersHorizontal className="w-4 h-4" /> Filters & Sort
      </button>

      <div className={`space-y-6 ${open ? "block" : "hidden lg:block"}`}>
        <div>
          <Label className="text-xs tracking-widest uppercase mb-3 block">Sort By</Label>
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateFilter("sort", opt.value)}
                className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                  (currentFilters.sort || "newest") === opt.value ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <Label className="text-xs tracking-widest uppercase mb-3 block">Category</Label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => updateFilter("category", cat.slug)}
                  className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                    currentFilters.category === cat.slug ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"
                  }`}>{cat.name}</button>
              ))}
            </div>
          </div>
        )}

        {brands.length > 0 && (
          <div>
            <Label className="text-xs tracking-widest uppercase mb-3 block">Brand</Label>
            <div className="space-y-1">
              {brands.map((b) => (
                <button key={b.id} onClick={() => updateFilter("brand", b.slug)}
                  className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                    currentFilters.brand === b.slug ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"
                  }`}>{b.name}</button>
              ))}
            </div>
          </div>
        )}

        {fabrics.length > 0 && (
          <div>
            <Label className="text-xs tracking-widest uppercase mb-3 block">Fabric</Label>
            <div className="space-y-1">
              {fabrics.map((f) => (
                <button key={f.id} onClick={() => updateFilter("fabric", f.slug)}
                  className={`block w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${
                    currentFilters.fabric === f.slug ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"
                  }`}>{f.name}</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs tracking-widest uppercase mb-3 block">Price Range</Label>
          <div className="flex gap-2">
            <Input type="number" placeholder="Min" defaultValue={currentFilters.minPrice}
              onBlur={(e) => updateFilter("minPrice", e.target.value)} className="text-sm" />
            <Input type="number" placeholder="Max" defaultValue={currentFilters.maxPrice}
              onBlur={(e) => updateFilter("maxPrice", e.target.value)} className="text-sm" />
          </div>
        </div>

        <button onClick={() => updateFilter("inStock", currentFilters.inStock ? "" : "true")}
          className={`text-sm py-1.5 px-2 rounded transition-colors ${
            currentFilters.inStock ? "bg-gold/10 text-gold font-medium" : "hover:bg-muted"
          }`}>In Stock Only</button>

        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-1" /> Clear Filters
        </Button>
      </div>
    </>
  );
}
