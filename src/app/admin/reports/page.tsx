"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { AdminLayout, AdminHeader, AdminCard, AdminButton } from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/utils";

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  dailySales: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales_count: number; price: number }[];
  couponUsage: { code: string; usage_count: number }[];
  inventory: { lowStock: number; outOfStock: number };
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Suit Society - Sales Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["Summary"],
      ["Total Revenue (30d)", data.totalRevenue],
      ["Total Orders (30d)", data.totalOrders],
      ["Low Stock Products", data.inventory.lowStock],
      ["Out of Stock Products", data.inventory.outOfStock],
      [],
      ["Daily Sales"],
      ["Date", "Revenue", "Orders"],
      ...data.dailySales.map((d) => [d.date, d.revenue, d.orders]),
      [],
      ["Top Products"],
      ["Name", "Sold Count", "Price"],
      ...data.topProducts.map((p) => [p.name, p.sales_count, p.price]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suit-society-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-6">
        <AdminHeader title="Reports" description="Generate and export business reports" />
        <AdminButton onClick={exportCsv} disabled={!data}>
          <Download className="w-4 h-4 mr-1 inline" /> Export CSV
        </AdminButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <AdminCard>
            <h3 className="text-white font-medium mb-4">Sales Summary (Last 30 Days)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Total Revenue</p>
                <p className="text-xl text-white font-medium">{formatPrice(data.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Total Orders</p>
                <p className="text-xl text-white font-medium">{data.totalOrders}</p>
              </div>
              <div>
                <p className="text-zinc-500">Low Stock</p>
                <p className="text-xl text-yellow-400 font-medium">{data.inventory.lowStock}</p>
              </div>
              <div>
                <p className="text-zinc-500">Out of Stock</p>
                <p className="text-xl text-red-400 font-medium">{data.inventory.outOfStock}</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-white font-medium mb-4">Top Products Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 border-b border-white/10">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Sold</th>
                    <th className="text-right py-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p.name} className="border-b border-white/5 text-zinc-300">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2 text-right">{p.sales_count}</td>
                      <td className="py-2 text-right">{formatPrice(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      ) : null}
    </AdminLayout>
  );
}
