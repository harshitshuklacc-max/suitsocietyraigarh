"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, updateProduct } from "@/actions/products";
import {
  CATALOG_COLORS,
  CATALOG_SIZES,
} from "@/lib/product-catalog";
import { barcodeFromProductCode } from "@/lib/barcode-utils";
import { getPrimaryImageUrl } from "@/lib/product-images";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { BarcodeDisplay } from "@/components/admin/BarcodeDisplay";
import { toast } from "sonner";
import { ImagePlus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

const STOCK_OPTIONS = [0, 1, 2, 5, 10, 15, 20, 25, 50, 100];

type AdminProduct = Product & {
  images?: { url: string }[];
  fabric?: { id: string; name: string } | null;
};

interface Props {
  categories: { id: string; name: string }[];
  fabrics: { id: string; name: string }[];
  product?: AdminProduct | null;
  availableSizes?: string[];
}

function getInitialPrices(product?: AdminProduct | null) {
  const mrp = product?.compare_at_price != null ? String(product.compare_at_price) : "";
  const sellingPrice = product?.price != null ? String(product.price) : "";
  return { mrp, sellingPrice };
}

export function ProductForm({ categories, fabrics, product, availableSizes }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const initialPrices = getInitialPrices(product);

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    getPrimaryImageUrl(product?.images, "")
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    product_code: product?.sku || "",
    name: product?.name || "",
    mrp: initialPrices.mrp,
    selling_price: initialPrices.sellingPrice,
    category_id: product?.category_id || "",
    color: product?.colors?.[0] || "",
    fabric_id: product?.fabric_id || "",
    sizes: product?.sizes || ([] as string[]),
    description: product?.description || "",
    stock: product?.stock != null ? String(product.stock) : "0",
    is_active: product?.is_active ?? true,
  });

  const mrpValue = parseFloat(form.mrp) || 0;
  const sellingPriceValue = parseFloat(form.selling_price) || 0;
  const discountPercent =
    mrpValue > sellingPriceValue
      ? calculateDiscountPercentage(mrpValue, sellingPriceValue)
      : 0;

  const sizeOptions = availableSizes?.length ? availableSizes : [...CATALOG_SIZES];
  const displaySizes = [...new Set([...sizeOptions, ...form.sizes])];

  const barcodePreview =
    product?.barcode || barcodeFromProductCode(form.product_code) || "";

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("product_code", form.product_code);
    fd.append("name", form.name);
    fd.append("mrp", form.mrp);
    fd.append("price", form.selling_price);
    fd.append("selling_price", form.selling_price);
    fd.append("compare_at_price", form.mrp);
    fd.append("category_id", form.category_id);
    fd.append("fabric_id", form.fabric_id);
    fd.append("stock", form.stock);
    fd.append("description", form.description);
    fd.append("colors", JSON.stringify(form.color ? [form.color] : []));
    fd.append("sizes", JSON.stringify(form.sizes));
    fd.append("is_active", form.is_active.toString());
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.category_id) {
      toast.error("Select a category");
      return;
    }

    setLoading(true);
    const fd = buildFormData();
    const result = isEdit && product
      ? await updateProduct(product.id, fd)
      : await createProduct(fd);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Product updated!" : "Product created!");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-gold"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Fields match your Excel sheet: Product Code, Product Name, MRP, Selling Price, Category, Color, Fabric, Size, Description, Stock.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Product Photo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-40 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={160}
                  height={192}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No photo yet</p>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="image">Upload Product Photo</Label>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Product Code</Label>
              <Input
                placeholder="e.g. SS997401"
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value })}
              />
            </div>
            <div>
              <Label>Product Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>MRP (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Original price"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
              />
            </div>
            <div>
              <Label>Selling Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Discounted price"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
              />
            </div>
          </div>

          {mrpValue > 0 && sellingPriceValue > 0 && (
            <div className="rounded-md bg-muted/40 px-4 py-3 text-sm space-y-1">
              <p>
                Customer will see:{" "}
                <span className="line-through text-muted-foreground">{formatPrice(mrpValue)}</span>{" "}
                <strong>{formatPrice(sellingPriceValue)}</strong>
              </p>
              {discountPercent > 0 && (
                <p className="text-emerald-600 font-medium">{discountPercent}% OFF</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category *</Label>
              <select
                className="w-full h-10 border rounded-md px-3 text-sm"
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Color</Label>
              <select
                className="w-full h-10 border rounded-md px-3 text-sm"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              >
                <option value="">Select color</option>
                {CATALOG_COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Fabric</Label>
              <select
                className="w-full h-10 border rounded-md px-3 text-sm"
                value={form.fabric_id}
                onChange={(e) => setForm({ ...form, fabric_id: e.target.value })}
              >
                <option value="">Select fabric</option>
                {fabrics.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Size</Label>
            <div className="flex flex-wrap gap-2">
              {displaySizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    form.sizes.includes(size)
                      ? "bg-gold/20 border-gold text-gold"
                      : "border-border hover:border-gold/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <Label className="mb-2 block">Stock</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {STOCK_OPTIONS.map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setForm({ ...form, stock: String(qty) })}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    form.stock === String(qty)
                      ? "bg-gold/20 border-gold text-gold"
                      : "border-border hover:border-gold/50"
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Product is active
            </label>
          )}
        </CardContent>
      </Card>

      {barcodePreview && (
        <Card>
          <CardHeader>
            <CardTitle>Barcode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Short barcode from product code. Download PNG or SVG for printing labels.
            </p>
            <BarcodeDisplay
              value={barcodePreview}
              productName={form.name}
              showDownload
            />
          </CardContent>
        </Card>
      )}

      <Button type="submit" variant="luxury" size="lg" disabled={loading}>
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : isEdit ? (
          "Save Changes"
        ) : (
          "Create Product"
        )}
      </Button>
    </form>
  );
}
